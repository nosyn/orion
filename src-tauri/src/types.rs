use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct SshConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_type: String,
    pub private_key_path: Option<String>,
    pub password: Option<String>,
}

#[derive(Serialize)]
pub struct SysInfo {
    pub hostname: String,
    pub os: String,
    pub kernel: String,
    // pub cuda: Option<String>,
    // pub jetpack: Option<String>,
    pub uptime_sec: u64,
}

#[derive(Serialize)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}
