use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    // Database fields
    pub id: Option<i64>,
    #[serde(rename = "deviceId")]
    pub device_id: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<i64>,

    // Live/System fields (fetched from the device)
    pub hostname: String,
    pub os: String,
    pub kernel: String,
    pub cuda: Option<String>,
    pub jetpack: Option<String>,
    #[serde(rename = "uptimeSec")]
    pub uptime_sec: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct StatPoint {
    pub ts: i64,
    pub cpu: f64,
    #[serde(rename = "ramUsedMb")]
    pub ram_used_mb: i64,
    #[serde(rename = "ramTotalMb")]
    pub ram_total_mb: i64,
    #[serde(rename = "gpuUtil")]
    pub gpu_util: Option<f64>,
    #[serde(rename = "gpuTempC")]
    pub gpu_temp_c: Option<f64>,
    #[serde(rename = "powerMode")]
    pub power_mode: Option<String>,
    #[serde(rename = "deviceId")]
    pub device_id: i64,
}

#[derive(Serialize, Deserialize)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}
