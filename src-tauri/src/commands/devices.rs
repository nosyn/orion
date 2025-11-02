use crate::commands::connection::validate_credential_cfg;
use crate::db::db_conn;
use crate::session::SESSIONS;
use crate::types::SshConfig;
use rusqlite::params;

#[tauri::command]
pub fn add_device(
    name: &str,
    description: Option<String>,
    credential: serde_json::Value,
) -> Result<i64, String> {
    let cfg: SshConfig = serde_json::from_value(credential).map_err(|e| e.to_string())?;
    // Use shared connection helpers
    validate_credential_cfg(&cfg)?;

    // Save device information
    let conn = db_conn()?;
    conn.execute(
        "INSERT INTO device (name, description) VALUES (?1, ?2)",
        params![name, description.unwrap_or_default()],
    )
    .map_err(|e| e.to_string())?;

    // Save credential bound to this device
    let device_id = conn.last_insert_rowid();
    conn.execute(
            "INSERT INTO credential (host, port, username, auth_type, password, private_key_path, device_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                &cfg.host,
                &cfg.port,
                &cfg.username,
                &cfg.auth_type,
                &cfg.password,
                &cfg.private_key_path,
                &device_id
            ],
        )
        .map_err(|e| e.to_string())?;

    Ok(device_id)
}

#[tauri::command]
pub fn remove_device(device_id: i64) -> Result<(), String> {
    // Remove any active session
    let mut map = SESSIONS.lock();
    map.remove(device_id.to_string().as_str());

    // Remove device and its associated credentials
    let conn = db_conn()?;
    conn.execute("DELETE FROM device WHERE id = ?1", params![device_id])
        .map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM credential WHERE device_id = ?1",
        params![device_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn list_devices() -> Result<serde_json::Value, String> {
    let conn = db_conn()?;
    let mut stmt = conn
        .prepare("SELECT id, name, description, serial_number, cpu_model, gpu_model, total_ram_mb, total_storage_mb, os, arch, hostname, mac_address, ip_address, notes, created_at, updated_at FROM device ORDER BY id ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>("id")?,
                "name": row.get::<_, String>("name")?,
                "description": row.get::<_, Option<String>>("description")?,
                "serial_number": row.get::<_, Option<String>>("serial_number")?,
                "cpu_model": row.get::<_, Option<String>>("cpu_model")?,
                "gpu_model": row.get::<_, Option<String>>("gpu_model")?,
                "total_ram_mb": row.get::<_, Option<i64>>("total_ram_mb")?,
                "total_storage_mb": row.get::<_, Option<i64>>("total_storage_mb")?,
                "os": row.get::<_, Option<String>>("os")?,
                "arch": row.get::<_, Option<String>>("arch")?,
                "hostname": row.get::<_, Option<String>>("hostname")?,
                "mac_address": row.get::<_, Option<String>>("mac_address")?,
                "ip_address": row.get::<_, Option<String>>("ip_address")?,
                "notes": row.get::<_, Option<String>>("notes")?,
                "created_at": row.get::<_, Option<i64>>("created_at")?,
                "updated_at": row.get::<_, Option<i64>>("updated_at")?,
            }))
        })
        .map_err(|e| e.to_string())?;
    let mut v = Vec::new();
    for r in rows {
        if let Ok(j) = r {
            v.push(j);
        }
    }
    Ok(serde_json::Value::Array(v))
}
