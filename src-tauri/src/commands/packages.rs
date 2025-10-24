#[tauri::command]
pub fn packages_list(_kind: &str, _query: Option<&str>) -> String {
    "".into()
}

#[tauri::command]
pub fn packages_install(_kind: &str, _pkg: &str) -> String {
    "ok".into()
}

#[tauri::command]
pub fn packages_remove(_kind: &str, _pkg: &str) -> String {
    "ok".into()
}
