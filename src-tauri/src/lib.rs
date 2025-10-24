// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use log::info;

mod commands;
mod db;
mod session;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging for the Rust backend so messages appear in the dev console.
    // Respect existing environment variable `RUST_LOG` if set; default to `info`.
    let _ = env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .try_init();

    info!("orion backend starting");

    // Ensure DB exists
    db::init_db();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::connection::connect,
            commands::connection::disconnect,
            commands::connection::probe_ssh,
            commands::connection::is_session_alive,
            commands::system::get_sys_info,
            commands::system::get_power_mode,
            commands::system::set_power_mode,
            commands::system::start_tegrastats_stream,
            commands::system::stop_tegrastats_stream,
            commands::files::list_dir,
            commands::files::read_file,
            commands::files::write_file,
            commands::files::rename,
            commands::files::remove,
            commands::files::mk_dir,
            commands::docker::docker_list_images,
            commands::docker::docker_list_containers,
            commands::docker::docker_run,
            commands::docker::docker_stop,
            commands::docker::docker_remove,
            commands::wifi::wifi_scan,
            commands::wifi::wifi_connect,
            commands::wifi::wifi_status,
            commands::wifi::net_speedtest,
            commands::packages::packages_list,
            commands::packages::packages_install,
            commands::packages::packages_remove,
            commands::credentials::save_credential,
            commands::credentials::list_credentials,
            commands::system::shutdown,
            commands::system::reboot
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
