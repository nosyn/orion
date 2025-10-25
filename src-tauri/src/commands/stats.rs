use crate::db::db_conn;
use crate::session::SESSIONS;
use once_cell::sync::Lazy;
use rusqlite::params;
use std::collections::HashMap;
use std::io::Read;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::Emitter;

// Track previous CPU totals per session token to compute usage delta
static LAST_CPU: Lazy<Mutex<HashMap<String, (u64, u64)>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

fn parse_cpu_line(line: &str) -> Option<(u64, u64)> {
    // line starts with: cpu  user nice system idle iowait irq softirq steal guest guest_nice
    let mut parts = line.split_whitespace();
    let _ = parts.next(); // "cpu"
    let nums: Vec<u64> = parts.filter_map(|p| p.parse::<u64>().ok()).collect();
    if nums.len() < 4 {
        return None;
    }
    let user = nums.get(0).copied().unwrap_or(0);
    let nice = nums.get(1).copied().unwrap_or(0);
    let system = nums.get(2).copied().unwrap_or(0);
    let idle = nums.get(3).copied().unwrap_or(0);
    let iowait = nums.get(4).copied().unwrap_or(0);
    let irq = nums.get(5).copied().unwrap_or(0);
    let softirq = nums.get(6).copied().unwrap_or(0);
    let steal = nums.get(7).copied().unwrap_or(0);
    let total = user + nice + system + idle + iowait + irq + softirq + steal;
    let idle_total = idle + iowait;
    Some((total, idle_total))
}

#[tauri::command]
pub fn record_stat(token: &str, device_id: Option<i64>) -> Result<serde_json::Value, String> {
    // get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(token).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    // Run a combined command to fetch CPU line and memory totals
    let cmd = "sh -lc 'cat /proc/stat | head -n1; free -m | awk \"/Mem:/ {print $2, $3}\"'";
    channel.exec(cmd).map_err(|e| e.to_string())?;
    let mut out = String::new();
    channel
        .read_to_string(&mut out)
        .map_err(|e| e.to_string())?;
    let _ = channel.wait_close();

    let mut lines = out.lines();
    let cpu_line = lines.next().unwrap_or("");
    let mem_line = lines.next().unwrap_or("");

    let (total, idle_total) =
        parse_cpu_line(cpu_line).ok_or_else(|| "failed to parse cpu".to_string())?;
    let (cpu_prev_total, cpu_prev_idle) = {
        let mut map = LAST_CPU.lock().unwrap();
        let prev = map.insert(token.to_string(), (total, idle_total));
        prev.unwrap_or((total, idle_total))
    };
    let dt = total.saturating_sub(cpu_prev_total);
    let didle = idle_total.saturating_sub(cpu_prev_idle);
    let cpu = if dt > 0 {
        (dt - didle) as f64 / dt as f64 * 100.0
    } else {
        0.0
    };

    let (ram_total_mb, ram_used_mb) = {
        let mut it = mem_line.split_whitespace();
        let total_s = it.next().unwrap_or("0");
        let used_s = it.next().unwrap_or("0");
        let total = total_s.parse::<i64>().unwrap_or(0);
        let used = used_s.parse::<i64>().unwrap_or(0);
        (total, used)
    };

    let ts = chrono::Utc::now().timestamp_millis();

    // Try to fetch tegrastats one-shot for GPU util and temperature (best-effort)
    let (gpu_util, gpu_temp_c): (Option<f64>, Option<f64>) = {
        let sess = handle.session.lock();
        if let Ok(mut ch2) = sess.channel_session() {
            if ch2
                .exec("sh -lc 'tegrastats --interval 1000 --count 1 2>/dev/null || sudo -n tegrastats --interval 1000 --count 1 2>/dev/null'")
                .is_ok()
            {
                let mut out = String::new();
                let _ = ch2.read_to_string(&mut out);
                let _ = ch2.wait_close();
                parse_tegrastats_line(out.lines().next().unwrap_or(""))
            } else {
                (None, None)
            }
        } else {
            (None, None)
        }
    };
    let conn = db_conn()?;
    let did = if let Some(id) = device_id {
        id
    } else {
        // fallback to default device id
        conn.query_row(
            "SELECT id FROM device WHERE name = 'default' LIMIT 1",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(1)
    };
    conn.execute(
        "INSERT INTO device_stats (ts, cpu, ram_used_mb, ram_total_mb, gpu_util, gpu_temp_c, power_mode, device_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, ?7)",
        params![ts, cpu, ram_used_mb, ram_total_mb, gpu_util, gpu_temp_c, did],
    )
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "ts": ts,
        "cpu": cpu,
        "ram_used_mb": ram_used_mb,
        "ram_total_mb": ram_total_mb,
        "gpu_util": gpu_util,
        "gpu_temp_c": gpu_temp_c,
        "device_id": did
    }))
}

#[tauri::command]
pub fn get_stats(
    device_id: i64,
    limit: Option<i64>,
    start_ts: Option<i64>,
    end_ts: Option<i64>,
) -> Result<serde_json::Value, String> {
    let conn = db_conn()?;
    let lim = limit.unwrap_or(120);
    let mut query = String::from("SELECT ts, cpu, ram_used_mb, ram_total_mb, gpu_util, gpu_temp_c, power_mode FROM device_stats WHERE device_id = ?1");
    let mut bind: Vec<rusqlite::types::Value> = vec![rusqlite::types::Value::from(device_id)];
    if let Some(s) = start_ts {
        query.push_str(" AND ts >= ?2");
        bind.push(rusqlite::types::Value::from(s));
    }
    if let Some(e) = end_ts {
        let idx = bind.len() + 1; // next index after current binds
        query.push_str(&format!(" AND ts <= ?{}", idx));
        bind.push(rusqlite::types::Value::from(e));
    }
    query.push_str(&format!(" ORDER BY ts DESC LIMIT {}", lim));
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params_from_iter(bind.into_iter()), |row| {
            Ok(serde_json::json!({
                "ts": row.get::<_, i64>(0)?,
                "cpu": row.get::<_, f64>(1)?,
                "ram_used_mb": row.get::<_, i64>(2)?,
                "ram_total_mb": row.get::<_, i64>(3)?,
                "gpu_util": row.get::<_, Option<f64>>(4)?,
                "gpu_temp_c": row.get::<_, Option<f64>>(5)?,
                "power_mode": row.get::<_, Option<String>>(6)?,
            }))
        })
        .map_err(|e| e.to_string())?;
    let mut v: Vec<serde_json::Value> = Vec::new();
    for r in rows {
        if let Ok(j) = r {
            v.push(j);
        }
    }
    v.reverse(); // chronological
    Ok(serde_json::Value::Array(v))
}

fn parse_tegrastats_line(line: &str) -> (Option<f64>, Option<f64>) {
    // Very loose parsing: look for "GR3D_FREQ <num>%" and "GPU@<num>C"
    let mut gpu_util: Option<f64> = None;
    let mut gpu_temp: Option<f64> = None;
    if let Some(idx) = line.find("GR3D_FREQ") {
        let s = &line[idx..];
        // find first number before %
        let pct = s
            .split('%')
            .next()
            .and_then(|part| part.rsplit_once(' '))
            .and_then(|(_, n)| n.parse::<f64>().ok());
        gpu_util = pct;
    }
    if let Some(idx) = line.find("GPU@") {
        let s = &line[idx + 4..];
        let c_str: String = s.chars().take_while(|ch| ch.is_ascii_digit()).collect();
        if let Ok(v) = c_str.parse::<f64>() {
            gpu_temp = Some(v);
        }
    }
    (gpu_util, gpu_temp)
}

// Background streaming management
static STREAM_FLAGS: Lazy<Mutex<HashMap<String, Arc<std::sync::atomic::AtomicBool>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
static STREAM_HANDLES: Lazy<Mutex<HashMap<String, std::thread::JoinHandle<()>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub fn start_stats_stream(
    app: tauri::AppHandle,
    token: &str,
    device_id: Option<i64>,
    interval_ms: Option<u64>,
) -> Result<(), String> {
    let t = token.to_string();
    let interval = interval_ms.unwrap_or(1000);
    // if already running, no-op
    if STREAM_HANDLES.lock().unwrap().contains_key(&t) {
        return Ok(());
    }
    let flag = Arc::new(std::sync::atomic::AtomicBool::new(true));
    STREAM_FLAGS.lock().unwrap().insert(t.clone(), flag.clone());
    let app_handle = app.clone();
    let tok = t.clone();
    let did = device_id;
    let handle = std::thread::spawn(move || {
        loop {
            if let Some(f) = STREAM_FLAGS.lock().unwrap().get(&tok) {
                if !f.load(std::sync::atomic::Ordering::Relaxed) {
                    break;
                }
            } else {
                break;
            }
            // best-effort: record stat and emit
            if let Ok(point) = record_stat(&tok, did) {
                let _ = app_handle.emit("tegrastats://point", point);
            }
            std::thread::sleep(Duration::from_millis(interval));
        }
    });
    STREAM_HANDLES.lock().unwrap().insert(t, handle);
    Ok(())
}

#[tauri::command]
pub fn stop_stats_stream(token: &str) -> Result<(), String> {
    let t = token.to_string();
    if let Some(flag) = STREAM_FLAGS.lock().unwrap().remove(&t) {
        flag.store(false, std::sync::atomic::Ordering::Relaxed);
    }
    if let Some(handle) = STREAM_HANDLES.lock().unwrap().remove(&t) {
        let _ = handle.join();
    }
    Ok(())
}
