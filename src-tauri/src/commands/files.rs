use crate::types::DirEntry;

#[tauri::command]
pub fn list_dir(_path: &str) -> Vec<DirEntry> {
    Vec::new()
}

#[tauri::command]
pub fn read_file(_path: &str) -> String {
    String::new()
}

#[tauri::command]
pub fn write_file(_path: &str, _content: &str) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn rename(_from: &str, _to: &str) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn remove(_path: &str) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn mk_dir(_path: &str) -> Result<(), String> {
    Ok(())
}
