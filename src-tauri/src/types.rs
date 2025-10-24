use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct SysInfo {
    pub hostname: String,
    pub os: String,
    pub kernel: String,
    #[serde(rename = "uptimeSec")]
    pub uptime_sec: u64,
}

#[derive(Serialize)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}

#[derive(Deserialize)]
pub struct SshConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    #[serde(rename = "authType")]
    pub auth_type: String,
    #[serde(rename = "privateKeyPath")]
    pub private_key_path: Option<String>,
    pub password: Option<String>,
}
