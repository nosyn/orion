use crate::types::SysInfo;

#[tauri::command]
pub fn get_sys_info() -> SysInfo {
    SysInfo {
        hostname: std::env::var("HOSTNAME").unwrap_or_else(|_| "localhost".into()),
        os: std::env::consts::OS.to_string(),
        kernel: "n/a".into(),
        uptime_sec: 0,
    }
}

#[tauri::command]
pub fn get_power_mode() -> String {
    "unknown".into()
}

#[tauri::command]
pub fn set_power_mode(_mode: i32) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn start_tegrastats_stream() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn stop_tegrastats_stream() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn shutdown() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn reboot() -> Result<(), String> {
    Ok(())
}
