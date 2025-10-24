// Shared types matching PLAN.md API surface

export type AuthType = 'key' | 'password';

export type SshConfig = {
  host: string;
  port: number;
  username: string;
  authType: AuthType;
  privateKeyPath?: string;
  password?: string;
};

export type SysInfo = {
  hostname: string;
  os: string;
  kernel: string;
  cuda?: string;
  jetpack?: string;
  uptimeSec: number;
};

export type StatPoint = {
  ts: number;
  cpu: number;
  ram_used_mb: number;
  ram_total_mb: number;
  gpu_util?: number;
  temp_c?: number;
  power_mode?: string | number;
};

export type WifiNetwork = {
  ssid: string;
  signal: number;
  security: string;
  active: boolean;
};
