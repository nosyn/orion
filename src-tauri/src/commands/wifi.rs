#[tauri::command]
pub fn wifi_scan() -> Vec<serde_json::Value> {
    Vec::new()
}

#[tauri::command]
pub fn wifi_connect(_ssid: &str, _password: Option<&str>) -> String {
    "ok".into()
}

#[tauri::command]
pub fn wifi_status() -> serde_json::Value {
    serde_json::json!({ "connected": false })
}

#[tauri::command]
pub fn net_speedtest() -> String {
    "0 Mbps".into()
}
