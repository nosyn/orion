use rusqlite::Connection;

pub fn db_path() -> std::path::PathBuf {
    let mut p = std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    p.push("orion.db");
    p
}

pub fn db_conn() -> Result<Connection, String> {
    let p = db_path();
    Connection::open(p).map_err(|e| e.to_string())
}

pub fn init_db() {
    if let Ok(conn) = db_conn() {
        let _ = conn.execute(
            "CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                username TEXT NOT NULL,
                auth_type TEXT NOT NULL,
                password TEXT,
                private_key_path TEXT
            )",
            [],
        );
    }
}
