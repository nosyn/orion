use crate::db::db_conn;
use rusqlite::params;

#[tauri::command]
pub fn add_device(name: &str, description: Option<String>) -> Result<i64, String> {
    let conn = db_conn()?;
    conn.execute(
        "INSERT INTO device (name, description) VALUES (?1, ?2)",
        params![name, description.unwrap_or_default()],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
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
