use crate::db::db_conn;
use crate::session::SESSIONS;
use crate::types::SystemInfo;
use rusqlite::params;
use std::io::Read;

#[tauri::command]
pub fn get_power_mode(device_id: i64) -> Result<String, String> {
    // Get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(&device_id.to_string()).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    // Query nvpmodel
    let cmd =
        "sh -lc 'sudo -n nvpmodel -q 2>/dev/null || nvpmodel -q 2>/dev/null || echo \"unknown\"'";
    channel.exec(cmd).map_err(|e| e.to_string())?;
    let mut out = String::new();
    channel
        .read_to_string(&mut out)
        .map_err(|e| e.to_string())?;
    let _ = channel.wait_close();

    // Parse output - typically "NV Power Mode: MODE_NAME"
    if let Some(line) = out.lines().find(|l| l.contains("Power Mode")) {
        if let Some(mode) = line.split(':').nth(1) {
            return Ok(mode.trim().to_string());
        }
    }

    Ok(out.trim().to_string())
}

#[tauri::command]
pub fn set_power_mode(device_id: i64, mode: i32) -> Result<(), String> {
    // Get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(&device_id.to_string()).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    // Set power mode
    let cmd = format!(
        "sh -lc 'sudo -n nvpmodel -m {} 2>/dev/null || nvpmodel -m {} 2>/dev/null'",
        mode, mode
    );
    channel.exec(&cmd).map_err(|e| e.to_string())?;
    let mut out = String::new();
    channel
        .read_to_string(&mut out)
        .map_err(|e| e.to_string())?;
    let _ = channel.wait_close();

    // Check exit status
    if let Ok(exit) = channel.exit_status() {
        if exit != 0 {
            return Err(format!("nvpmodel failed: {}", out));
        }
    }

    Ok(())
}

#[tauri::command]
pub fn shutdown(device_id: i64) -> Result<String, String> {
    // Get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(&device_id.to_string()).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    let cmd = "sudo -n shutdown";

    channel.exec(cmd).map_err(|e| e.to_string())?;

    // Read stdout, which will contain the broadcast message on success
    let mut stdout = String::new();
    channel
        .read_to_string(&mut stdout)
        .map_err(|e| e.to_string())?;

    // Read stderr to capture any errors (e.g., "sudo: a password is required")
    let mut stderr = String::new();
    channel
        .stderr()
        .read_to_string(&mut stderr)
        .map_err(|e| e.to_string())?;

    // Wait for the channel to close.
    // This will work fine now, as the command returns immediately
    // while the shutdown is scheduled in the background.
    let _ = channel.wait_close();

    // Get the command's exit status
    let exit_status = channel
        .exit_status()
        .map_err(|e| format!("Failed to get exit status: {}", e.to_string()))?;

    // Check if the command failed
    if exit_status != 0 {
        // If stderr has an error message, return it
        if !stderr.is_empty() {
            return Err(stderr.trim().to_string());
        }
        // Otherwise, return a generic error
        return Err(format!(
            "Shutdown command failed with exit status: {}",
            exit_status
        ));
    }

    // Success! Return the message from stdout.
    // If stdout is empty, return a default success message.
    if stdout.is_empty() {
        Ok("Shutdown scheduled successfully.".to_string())
    } else {
        Ok(stdout.trim().to_string())
    }
}

#[tauri::command]
pub fn reboot(device_id: i64) -> Result<(), String> {
    // Get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(&device_id.to_string()).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    let cmd = "sh -lc 'sudo -n reboot 2>/dev/null || reboot 2>/dev/null'";
    channel.exec(cmd).map_err(|e| e.to_string())?;
    let _ = channel.wait_close();

    Ok(())
}

// Fetch live data and save it.
#[tauri::command]
pub fn fetch_and_store_sys_info(device_id: i64) -> Result<SystemInfo, String> {
    // Get session
    let handle = {
        let map = SESSIONS.lock();
        map.get(&device_id.to_string()).cloned()
    }
    .ok_or_else(|| "session not found".to_string())?;

    let mut channel = {
        let sess = handle.session.lock();
        sess.channel_session().map_err(|e| e.to_string())?
    };

    // Run command to fetch system info
    let cmd = r#"sh -lc '
        hostname=$(hostname)
        os=$(uname -s)
        kernel=$(uname -r)
        cuda=$(nvcc --version 2>/dev/null | grep "release" | sed -E "s/.*release ([0-9.]+).*/\1/" || echo "")
        jetpack=$(dpkg -l | grep nvidia-jetpack | awk "{print \$3}" | head -1 || echo "")
        uptime_sec=$(cat /proc/uptime | awk "{print int(\$1)}")
        
        echo "$hostname"
        echo "$os"
        echo "$kernel"
        echo "$cuda"
        echo "$jetpack"
        echo "$uptime_sec"
    '"#;

    // --- THIS IS THE MISSING BLOCK ---
    channel.exec(cmd).map_err(|e| e.to_string())?;
    let mut out = String::new();
    channel
        .read_to_string(&mut out)
        .map_err(|e| e.to_string())?;
    let _ = channel.wait_close();
    // ---------------------------------

    let lines: Vec<&str> = out.lines().collect();
    let now = chrono::Utc::now().timestamp_millis();

    let sys_info = SystemInfo {
        // Database metadata is populated here for the *save* operation
        id: None, // No ID yet
        device_id,
        updated_at: Some(now),

        // Live/System fields
        hostname: lines.get(0).unwrap_or(&"unknown").to_string(),
        os: lines.get(1).unwrap_or(&"unknown").to_string(),
        kernel: lines.get(2).unwrap_or(&"unknown").to_string(),
        cuda: {
            let cuda = lines.get(3).unwrap_or(&"").to_string();
            if cuda.is_empty() {
                None
            } else {
                Some(cuda)
            }
        },
        jetpack: {
            let jp = lines.get(4).unwrap_or(&"").to_string();
            if jp.is_empty() {
                None
            } else {
                Some(jp)
            }
        },
        uptime_sec: lines
            .get(5)
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0),
    };

    // Save to database
    if let Ok(conn) = db_conn() {
        // Use the new struct fields
        let uptime_i64 = sys_info.uptime_sec as i64;
        let updated_at_i64 = sys_info.updated_at.unwrap_or(now); // Use 'now' if for some reason it's None

        // Try to update existing record first
        let updated = conn.execute(
                "UPDATE system_info SET hostname = ?1, os = ?2, kernel = ?3, cuda = ?4, jetpack = ?5, uptime_sec = ?6, updated_at = ?7 WHERE device_id = ?8",
                params![
                    &sys_info.hostname,
                    &sys_info.os,
                    &sys_info.kernel,
                    &sys_info.cuda,
                    &sys_info.jetpack,
                    uptime_i64,
                    updated_at_i64,
                    device_id
                ],
            ).unwrap_or(0);

        // If no rows updated, insert new record
        if updated == 0 {
            let _ = conn.execute(
                    "INSERT INTO system_info (device_id, hostname, os, kernel, cuda, jetpack, uptime_sec, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        device_id,
                        &sys_info.hostname,
                        &sys_info.os,
                        &sys_info.kernel,
                        &sys_info.cuda,
                        &sys_info.jetpack,
                        uptime_i64,
                        updated_at_i64
                    ],
                );
        }
    }

    Ok(sys_info)
}

#[tauri::command]
// Renamed to clearly indicate it retrieves stored data from the DB.
pub fn get_stored_sys_info(device_id: i64) -> Result<Option<SystemInfo>, String> {
    let conn = db_conn()?;
    let mut stmt = conn
        .prepare("SELECT id, device_id, hostname, os, kernel, cuda, jetpack, uptime_sec, updated_at FROM system_info WHERE device_id = ?1")
        .map_err(|e| e.to_string())?;

    let result = stmt.query_row([device_id], |row| {
        Ok(SystemInfo {
            // DB fields are now required in the merged struct and populated from the row
            id: row.get("id").ok(), // Get the ID, make it Option<i64>
            device_id: row.get("device_id")?,
            updated_at: row.get("updated_at").ok(), // Get updated_at, make it Option<i64>

            // System fields
            hostname: row.get("hostname")?,
            os: row.get("os")?,
            kernel: row.get("kernel")?,
            cuda: row.get("cuda")?,
            jetpack: row.get("jetpack")?,
            uptime_sec: row.get::<_, i64>("uptime_sec")? as u64, // Cast back to u64
        })
    });

    match result {
        Ok(row) => Ok(Some(row)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}
