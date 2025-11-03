export enum IpcChannelEnum {
  // Connection commands
  CONNECT_DEVICE = 'connect_device',
  DISCONNECT_DEVICE = 'disconnect_device',
  PROBE_SSH = 'probe_ssh',
  IS_SESSION_ALIVE = 'is_session_alive',
  LIST_SESSIONS = 'list_sessions',

  // Device commands
  ADD_DEVICE = 'add_device',
  LIST_DEVICES = 'list_devices',
  REMOVE_DEVICE = 'remove_device',

  // Stats commands
  RECORD_STAT = 'record_stat',
  GET_STATS = 'get_stats',
  START_STATS_STREAM = 'start_stats_stream',
  STOP_STATS_STREAM = 'stop_stats_stream',
  STREAM_STATS = 'stream_stats',
  STOP_STREAM_STATS = 'stop_stream_stats',

  // System commands
  GET_POWER_MODE = 'get_power_mode',
  SET_POWER_MODE = 'set_power_mode',
  SHUTDOWN = 'shutdown',
  REBOOT = 'reboot',
  FETCH_AND_STORE_SYS_INFO = 'fetch_and_store_sys_info',
  GET_STORED_SYS_INFO = 'get_stored_sys_info',
}
