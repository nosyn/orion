#[tauri::command]
pub fn docker_list_images() -> Vec<serde_json::Value> {
    Vec::new()
}

#[tauri::command]
pub fn docker_list_containers() -> Vec<serde_json::Value> {
    Vec::new()
}

#[tauri::command]
pub fn docker_run(_image: &str, _args: Option<&str>) -> String {
    "not-run".into()
}

#[tauri::command]
pub fn docker_stop(_id: &str) -> String {
    "stopped".into()
}

#[tauri::command]
pub fn docker_remove(_id: &str) -> String {
    "removed".into()
}
