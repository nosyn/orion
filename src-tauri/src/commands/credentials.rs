use crate::db::db_conn;
use crate::types::SshConfig;
use rusqlite::params;

#[tauri::command]
pub fn save_credential(config: serde_json::Value, device_id: Option<i64>) -> Result<i64, String> {
    let cfg: SshConfig = serde_json::from_value(config).map_err(|e| e.to_string())?;
    let conn = db_conn()?;
    let did = if let Some(id) = device_id {
        id
    } else {
        conn.query_row(
            "SELECT id FROM device WHERE name = 'default' LIMIT 1",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(1)
    };
    conn
        .execute(
            "INSERT INTO credential (host, port, username, auth_type, password, private_key_path, device_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                &cfg.host,
                &cfg.port,
                &cfg.username,
                &cfg.auth_type,
                &cfg.password,
                &cfg.private_key_path,
                &did
            ],
        )
        .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(id)
}
