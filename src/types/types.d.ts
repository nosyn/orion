// Shared types matching `src-tauri/src/types.rs`

type AuthType = 'key' | 'password';

type SshConfig = {
  host: string;
  port: number;
  username: string;
  authType: AuthType;
  privateKeyPath?: string;
  password?: string;
};

type SystemInfo = {
  id?: number;
  deviceId: number;
  hostname: string;
  os: string;
  kernel: string;
  cuda: string | null;
  jetpack: string | null;
  uptimeSec: number;
  updatedAt?: number;
};

type StatPoint = {
  ts: number;
  cpu: number;
  ramUsedMb: number;
  ramTotalMb: number;
  gpuUtil?: number | null;
  gpuTempC?: number | null;
  powerMode?: string | null;
  deviceId: number;
};

type WifiNetwork = {
  ssid: string;
  signal: number;
  security: string;
  active: boolean;
};

type Device = {
  id: number;
  name: string;
  description?: string | null;
  notes?: string | null;
  lastConnectedAt?: number;
  createdAt: number;
  updatedAt: number;
};
