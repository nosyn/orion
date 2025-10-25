export enum IpcChannelEnum {
  // Connection commands
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PROBE_SSH = 'probe_ssh',
  IS_SESSION_ALIVE = 'is_session_alive',

  // System commands
  GET_SYS_INFO = 'get_sys_info',
  GET_POWER_MODE = 'get_power_mode',
  SET_POWER_MODE = 'set_power_mode',
  START_TEGRASTATS_STREAM = 'start_tegrastats_stream',
  STOP_TEGRASTATS_STREAM = 'stop_tegrastats_stream',
  SHUTDOWN = 'shutdown',
  REBOOT = 'reboot',

  // File commands
  LIST_DIR = 'list_dir',
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  RENAME = 'rename',
  REMOVE = 'remove',
  MK_DIR = 'mk_dir',

  // Docker commands
  DOCKER_LIST_IMAGES = 'docker_list_images',
  DOCKER_LIST_CONTAINERS = 'docker_list_containers',
  DOCKER_RUN = 'docker_run',
  DOCKER_STOP = 'docker_stop',
  DOCKER_REMOVE = 'docker_remove',

  // WiFi commands
  WIFI_SCAN = 'wifi_scan',
  WIFI_CONNECT = 'wifi_connect',
  WIFI_STATUS = 'wifi_status',
  NET_SPEEDTEST = 'net_speedtest',

  // Package commands
  PACKAGES_LIST = 'packages_list',
  PACKAGES_INSTALL = 'packages_install',
  PACKAGES_REMOVE = 'packages_remove',

  // Credential commands
  SAVE_CREDENTIAL = 'save_credential',
  LIST_CREDENTIALS = 'list_credentials',
}
