// Shared types matching `src-tauri/src/types.rs`

type AuthType = 'key' | 'password';

type SshConfig = {
  host: string;
  port: number;
  username: string;
  auth_type: AuthType;
  private_key_path?: string;
  password?: string;
};

type SysInfo = {
  hostname: string;
  os: string;
  kernel: string;
  cuda?: string;
  jetpack?: string;
  uptimeSec: number;
};

type StatPoint = {
  ts: number;
  cpu: number;
  ram_used_mb: number;
  ram_total_mb: number;
  gpu_util?: number;
  temp_c?: number;
  power_mode?: string | number;
};

type WifiNetwork = {
  ssid: string;
  signal: number;
  security: string;
  active: boolean;
};
