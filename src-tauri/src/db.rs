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
        // device table - minimal core info only
        let _ = conn.execute(
            "CREATE TABLE IF NOT EXISTS device (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                notes TEXT,
                last_connected_at INTEGER,
                created_at INTEGER,
                updated_at INTEGER
            )",
            [],
        );

        // credential table with FK to device (logical, not enforced)
        let _ = conn.execute(
            "CREATE TABLE IF NOT EXISTS credential (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                username TEXT NOT NULL,
                auth_type TEXT NOT NULL,
                password TEXT,
                private_key_path TEXT,
                device_id INTEGER UNIQUE NOT NULL
            )",
            [],
        );

        // device_stats table with extended metrics and index
        let _ = conn.execute(
            "CREATE TABLE IF NOT EXISTS device_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts INTEGER NOT NULL,
                cpu REAL NOT NULL,
                ram_used_mb INTEGER NOT NULL,
                ram_total_mb INTEGER NOT NULL,
                gpu_util REAL,
                gpu_temp_c REAL,
                power_mode TEXT,
                device_id INTEGER NOT NULL
            )",
            [],
        );
        let _ = conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_device_stats_device_ts ON device_stats(device_id, ts)",
            [],
        );

        // system_info table - stores system information per device
        // This is the source of truth for hardware/OS details
        let _ = conn.execute(
            "CREATE TABLE IF NOT EXISTS system_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER NOT NULL UNIQUE,
                hostname TEXT NOT NULL,
                os TEXT NOT NULL,
                kernel TEXT NOT NULL,
                cuda TEXT,
                jetpack TEXT,
                uptime_sec INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        );
        let _ = conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_system_info_device ON system_info(device_id)",
            [],
        );
    }
}
