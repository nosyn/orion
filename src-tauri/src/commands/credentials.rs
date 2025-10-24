use crate::db::db_conn;
use crate::types::SshConfig;

#[tauri::command]
pub fn save_credential(config: serde_json::Value) -> Result<i64, String> {
    let cfg: SshConfig = serde_json::from_value(config).map_err(|e| e.to_string())?;
    let conn = db_conn()?;
    conn.execute(
        "INSERT INTO credentials (host, port, username, auth_type, password, private_key_path) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [
            &cfg.host as &dyn rusqlite::ToSql,
            &cfg.port,
            &cfg.username,
            &cfg.auth_type,
            &cfg.password,
            &cfg.private_key_path,
        ],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(id)
}

#[tauri::command]
pub fn list_credentials() -> Result<serde_json::Value, String> {
    let conn = db_conn()?;
    let mut stmt = conn
        .prepare("SELECT id, host, port, username, auth_type, password, private_key_path FROM credentials")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>(0)?,
                "host": row.get::<_, String>(1)?,
                "port": row.get::<_, i64>(2)?,
                "username": row.get::<_, String>(3)?,
                "auth_type": row.get::<_, String>(4)?,
                "password": row.get::<_, Option<String>>(5)?,
                "private_key_path": row.get::<_, Option<String>>(6)?,
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
