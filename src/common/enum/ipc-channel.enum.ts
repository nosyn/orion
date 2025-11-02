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
}
