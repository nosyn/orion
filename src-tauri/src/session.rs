use once_cell::sync::Lazy;
use parking_lot::Mutex;
use ssh2::Session as SshSession;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Clone)]
pub struct SessionHandle {
    pub session: Arc<Mutex<SshSession>>,
}

pub static SESSIONS: Lazy<Mutex<HashMap<String, SessionHandle>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
