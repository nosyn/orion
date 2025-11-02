use crate::db::db_conn;
use crate::session::{SessionHandle, SESSIONS};
use crate::types::SshConfig;
use log::{info, warn};
use parking_lot::Mutex;
use ssh2::Session as SshSession;
use std::net::{TcpStream, ToSocketAddrs};
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

#[tauri::command]
pub fn probe_ssh(host: &str, port: u16) -> Result<bool, String> {
    let addr_str = format!("{}:{}", host, port);
    let addrs = addr_str.to_socket_addrs().map_err(|e| e.to_string())?;
    let timeout = Duration::from_secs(3);
    for addr in addrs {
        if TcpStream::connect_timeout(&addr, timeout).is_ok() {
            return Ok(true);
        }
    }
    Err("unreachable".into())
}

#[tauri::command]
pub fn connect_device(device_id: i64) -> Result<String, String> {
    info!("connect_device requested for device_id={}", device_id);

    if SESSIONS.lock().contains_key(device_id.to_string().as_str()) {
        return Ok(device_id.to_string());
    }

    // Fetch credential for device
    let conn = db_conn()?;
    let mut stmt = conn
        .prepare(
            "SELECT host, port, username, auth_type, password, private_key_path FROM credential WHERE device_id = ?1 LIMIT 1",
        )
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([device_id]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let host: String = row.get(0).map_err(|e| e.to_string())?;
        let port: i64 = row.get(1).map_err(|e| e.to_string())?;
        let username: String = row.get(2).map_err(|e| e.to_string())?;
        let auth_type: String = row.get(3).map_err(|e| e.to_string())?;
        let password: Option<String> = row.get(4).map_err(|e| e.to_string())?;
        let private_key_path: Option<String> = row.get(5).map_err(|e| e.to_string())?;

        let val: SshConfig = SshConfig {
            host,
            port: (port as u16),
            username,
            auth_type,
            private_key_path,
            password,
        };
        // Delegate to existing connect logic
        return connect(device_id.to_string(), val);
    }

    Err("no credential for device".into())
}

#[tauri::command]
pub fn disconnect_device(device_id: i64) -> Result<String, String> {
    info!("disconnect_device requested for device_id={}", device_id);

    let mut map = SESSIONS.lock();
    if map.remove(device_id.to_string().as_str()).is_some() {
        info!("session {} removed", device_id);
        Ok(device_id.to_string())
    } else {
        Err("session not found".into())
    }
}

#[tauri::command]
pub fn is_session_alive(device_id: &str) -> bool {
    SESSIONS.lock().contains_key(device_id)
}

#[tauri::command]
pub fn list_sessions() -> Vec<String> {
    SESSIONS
        .lock()
        .keys()
        .map(|k| k.to_string())
        .collect::<Vec<String>>()
}

pub fn validate_credential_cfg(cfg: &SshConfig) -> Result<(), String> {
    probe_ssh(&cfg.host, cfg.port)?;
    create_authenticated_session(cfg)?;
    Ok(())
}

fn connect(device_id: String, cfg: SshConfig) -> Result<String, String> {
    info!(
        "connect requested: host={} port={} user={} auth={}",
        cfg.host, cfg.port, cfg.username, cfg.auth_type
    );

    let sess = create_authenticated_session(&cfg)?;

    let session = Arc::new(Mutex::new(sess));
    let handle = SessionHandle { session };

    SESSIONS.lock().insert(device_id.clone(), handle);

    // Background monitor thread
    let monitor_id = device_id.clone();
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_secs(5));
        let mut should_remove = false;

        {
            let map = SESSIONS.lock();
            if let Some(h) = map.get(&monitor_id) {
                let guard = h.session.lock();
                match guard.channel_session() {
                    Ok(mut ch) => {
                        if ch.exec("true").is_err() {
                            should_remove = true;
                        }
                        let _ = ch.close();
                        let _ = ch.wait_close();
                    }
                    Err(_) => should_remove = true,
                }
            } else {
                break;
            }
        }

        if should_remove {
            SESSIONS.lock().remove(&monitor_id);
            break;
        }
    });
    Ok(device_id)
}

/// Shared logic: TCP connect + SSH handshake + authentication
fn create_authenticated_session(cfg: &SshConfig) -> Result<SshSession, String> {
    let addr_str = format!("{}:{}", cfg.host, cfg.port);
    let addrs = addr_str.to_socket_addrs().map_err(|e| e.to_string())?;

    let timeout = Duration::from_secs(5);
    let mut stream_opt = None;

    for addr in addrs {
        if let Ok(s) = TcpStream::connect_timeout(&addr, timeout) {
            stream_opt = Some(s);
            break;
        }
    }

    let stream = stream_opt.ok_or_else(|| "Unable to open TCP connection".to_string())?;

    info!("tcp connect succeeded to {}", addr_str);

    let mut sess = SshSession::new().map_err(|e| e.to_string())?;
    sess.set_tcp_stream(stream);
    sess.handshake().map_err(|e| e.to_string())?;

    info!("ssh handshake succeeded");

    match cfg.auth_type.as_str() {
        "password" => {
            let password = cfg.password.as_deref().unwrap_or("<no-password>");
            sess.userauth_password(&cfg.username, password)
                .map_err(|e| map_error(&e.to_string()))?;
        }
        "key" => {
            let key_path = cfg
                .private_key_path
                .as_ref()
                .ok_or_else(|| "privateKeyPath required".to_string())?;

            sess.userauth_pubkey_file(
                &cfg.username,
                None,
                Path::new(key_path),
                cfg.password.as_deref(),
            )
            .map_err(|e| map_error(&e.to_string()))?;
        }
        _ => return Err("unsupported auth type".into()),
    }

    if !sess.authenticated() {
        warn!("ssh session not authenticated");
        return Err("authentication failed".into());
    }

    info!("ssh authenticated for user={}", cfg.username);
    Ok(sess)
}

fn map_error(raw: &str) -> String {
    let s = raw.to_lowercase();
    if s.contains("auth") || s.contains("permission denied") || s.contains("authentication failed")
    {
        return "Authentication Failed".into();
    }
    if s.contains("timeout") || s.contains("timed out") {
        return "Connection Timed Out".into();
    }
    if s.contains("unable to open tcp connection")
        || s.contains("unreachable")
        || s.contains("connection refused")
    {
        return "host unreachable or port closed".into();
    }
    raw.to_string()
}
