pub mod connection;
pub mod credentials;
pub mod devices;
pub mod docker;
pub mod files;
pub mod packages;
pub mod stats;
pub mod system;
pub mod wifi;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
