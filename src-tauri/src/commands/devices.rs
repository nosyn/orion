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
        .prepare("SELECT id, name, description FROM device ORDER BY id ASC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>(0)?,
                "name": row.get::<_, String>(1)?,
                "description": row.get::<_, Option<String>>(2)?,
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
