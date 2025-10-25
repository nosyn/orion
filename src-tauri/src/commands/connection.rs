use crate::session::{SessionHandle, SESSIONS};
use crate::types::SshConfig;
use log::{error, info, warn};
use parking_lot::Mutex;
use ssh2::Session as SshSession;
use std::net::{TcpStream, ToSocketAddrs};
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;
use uuid::Uuid;

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
pub fn connect(config: serde_json::Value) -> Result<String, String> {
    let cfg: SshConfig = serde_json::from_value(config).map_err(|e| e.to_string())?;

    info!(
        "connect requested: host={} port={} user={} auth={}",
        cfg.host, cfg.port, cfg.username, cfg.auth_type
    );

    let addr_str = format!("{}:{}", cfg.host, cfg.port);
    let addrs = addr_str.to_socket_addrs().map_err(|e| e.to_string())?;
    let timeout = Duration::from_secs(5);
    let mut stream_opt: Option<TcpStream> = None;
    for addr in addrs {
        if let Ok(s) = TcpStream::connect_timeout(&addr, timeout) {
            stream_opt = Some(s);
            break;
        }
    }
    let stream = stream_opt.ok_or_else(|| "Unable to open TCP connection".to_string())?;
    info!("tcp connect succeeded to {}", addr_str);

    let mut sess = SshSession::new().map_err(|e| e.to_string())?;
    sess.set_tcp_stream(stream.try_clone().map_err(|e| e.to_string())?);
    sess.handshake().map_err(|e| e.to_string())?;
    info!("ssh handshake succeeded");

    match cfg.auth_type.as_str() {
        "password" => {
            let _pwd = cfg.password.as_deref().unwrap_or("<no-password>");
            if let Err(e) = sess.userauth_password(&cfg.username, _pwd) {
                error!("ssh password auth error: {}", e);
                return Err(map_error(&e.to_string()));
            }
        }
        "key" => {
            let key_path = cfg
                .private_key_path
                .as_ref()
                .ok_or_else(|| "privateKeyPath required".to_string())?;
            let p = Path::new(key_path);
            if let Err(e) =
                sess.userauth_pubkey_file(&cfg.username, None, p, cfg.password.as_deref())
            {
                error!("ssh key auth error: {}", e);
                return Err(map_error(&e.to_string()));
            }
        }
        _ => return Err("unsupported auth type".into()),
    }

    if !sess.authenticated() {
        warn!("ssh session not authenticated");
        return Err("authentication failed".into());
    }

    info!("ssh authenticated for user={}", cfg.username);

    let token = Uuid::new_v4().to_string();
    let session = Arc::new(Mutex::new(sess));
    let handle = SessionHandle { session };
    SESSIONS.lock().insert(token.clone(), handle);

    // background monitor to remove dead sessions
    let token_clone = token.clone();
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(5));
        let mut remove = false;
        {
            let map = SESSIONS.lock();
            if let Some(h) = map.get(&token_clone) {
                let guard = h.session.lock();
                match guard.channel_session() {
                    Ok(mut ch) => {
                        if ch.exec("true").is_err() {
                            remove = true;
                        }
                        let _ = ch.close();
                        let _ = ch.wait_close();
                    }
                    Err(_) => {
                        remove = true;
                    }
                }
            } else {
                break;
            }
        }
        if remove {
            SESSIONS.lock().remove(&token_clone);
            break;
        }
    });

    Ok(token)
}

#[tauri::command]
pub fn disconnect(token: &str) -> Result<(), String> {
    let mut map = SESSIONS.lock();
    if map.remove(token).is_some() {
        info!("session {} removed", token);
        Ok(())
    } else {
        Err("session not found".into())
    }
}

#[tauri::command]
pub fn is_session_alive(token: &str) -> bool {
    SESSIONS.lock().contains_key(token)
}

fn map_error(raw: &str) -> String {
    let s = raw.to_lowercase();
    if s.contains("auth") || s.contains("permission denied") || s.contains("authentication failed")
    {
        return "authentication failed".into();
    }
    if s.contains("timeout") || s.contains("timed out") {
        return "connection timed out".into();
    }
    if s.contains("unable to open tcp connection")
        || s.contains("unreachable")
        || s.contains("connection refused")
    {
        return "host unreachable or port closed".into();
    }
    raw.to_string()
}
