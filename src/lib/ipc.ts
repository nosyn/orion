// Frontend IPC wrappers: prefer invoking Tauri commands when available,

import { invoke } from '@tauri-apps/api/core';
import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';

export async function is_session_alive(token: string): Promise<boolean> {
  try {
    return await invoke('is_session_alive', { token });
  } catch (err) {
    return false;
  }
}

// --- Devices
export async function add_device(
  name: string,
  description?: string
): Promise<number> {
  return await invoke(IpcChannelEnum.ADD_DEVICE, { name, description });
}

export async function list_devices(): Promise<
  Array<{ id: number; name: string; description?: string }>
> {
  return await invoke(IpcChannelEnum.LIST_DEVICES);
}

// --- Stats
export async function record_stat(
  token: string,
  device_id?: number
): Promise<StatPoint & { device_id: number }> {
  return await invoke(IpcChannelEnum.RECORD_STAT, {
    token,
    device_id,
  });
}

export async function get_stats(
  device_id: number,
  opts?: { limit?: number; start_ts?: number; end_ts?: number }
): Promise<StatPoint[]> {
  const { limit = 120, start_ts, end_ts } = opts || {};
  return await invoke(IpcChannelEnum.GET_STATS, {
    device_id,
    limit,
    start_ts,
    end_ts,
  });
}

export async function start_stats_stream(
  token: string,
  device_id?: number,
  interval_ms = 1000
): Promise<void> {
  return await invoke(IpcChannelEnum.START_STATS_STREAM, {
    token,
    device_id,
    interval_ms,
  });
}

export async function stop_stats_stream(token: string): Promise<void> {
  return await invoke(IpcChannelEnum.STOP_STATS_STREAM, { token });
}
// --- System
export async function get_sys_info(): Promise<SysInfo> {
  try {
    return await invoke(IpcChannelEnum.GET_SYS_INFO);
  } catch (err) {
    // Lightweight browser mock
    return {
      hostname:
        typeof window !== 'undefined'
          ? window.location.hostname || 'localhost'
          : 'localhost',
      os:
        (typeof navigator !== 'undefined' && (navigator as any).platform) ||
        'browser',
      kernel: 'n/a',
      uptimeSec: 0,
    } as SysInfo;
  }
}

export async function get_power_mode(): Promise<string> {
  try {
    return await invoke(IpcChannelEnum.GET_POWER_MODE);
  } catch (err) {
    return 'unknown';
  }
}

export async function set_power_mode(mode: number): Promise<void> {
  try {
    return await invoke(IpcChannelEnum.SET_POWER_MODE, { mode });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function start_tegrastats_stream(): Promise<void> {
  try {
    return await invoke(IpcChannelEnum.START_TEGRASTATS_STREAM);
  } catch (err) {
    return Promise.resolve();
  }
}

export async function stop_tegrastats_stream(): Promise<void> {
  try {
    return await invoke(IpcChannelEnum.STOP_TEGRASTATS_STREAM);
  } catch (err) {
    return Promise.resolve();
  }
}

// --- Terminal
export async function terminal_open(
  id: string,
  cols: number,
  rows: number
): Promise<void> {
  try {
    return await invoke('terminal_open', { id, cols, rows });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function terminal_write(id: string, data: string): Promise<void> {
  try {
    return await invoke('terminal_write', { id, data });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function terminal_resize(
  id: string,
  cols: number,
  rows: number
): Promise<void> {
  try {
    return await invoke('terminal_resize', { id, cols, rows });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function terminal_close(id: string): Promise<void> {
  try {
    return await invoke('terminal_close', { id });
  } catch (err) {
    return Promise.resolve();
  }
}

// --- Files
export type DirEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
};

export async function list_dir(path: string): Promise<DirEntry[]> {
  try {
    return await invoke('list_dir', { path });
  } catch (err) {
    return [];
  }
}

export async function read_file(path: string): Promise<string> {
  try {
    return await invoke('read_file', { path });
  } catch (err) {
    return '';
  }
}

export async function write_file(path: string, content: string): Promise<void> {
  try {
    return await invoke('write_file', { path, content });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function rename(from: string, to: string): Promise<void> {
  try {
    return await invoke('rename', { from, to });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function remove(path: string): Promise<void> {
  try {
    return await invoke('remove', { path });
  } catch (err) {
    return Promise.resolve();
  }
}

export async function mk_dir(path: string): Promise<void> {
  try {
    return await invoke('mk_dir', { path });
  } catch (err) {
    return Promise.resolve();
  }
}

// --- Docker
export type DockerImage = {
  id: string;
  repo: string;
  tag: string;
  size: string;
};
export type DockerContainer = {
  id: string;
  image: string;
  name: string;
  status: string;
};

export async function docker_list_images(): Promise<DockerImage[]> {
  try {
    return await invoke('docker_list_images');
  } catch (err) {
    return [];
  }
}

export async function docker_list_containers(): Promise<DockerContainer[]> {
  try {
    return await invoke('docker_list_containers');
  } catch (err) {
    return [];
  }
}

export async function docker_run(
  image: string,
  args?: string
): Promise<string> {
  try {
    return await invoke('docker_run', { image, args });
  } catch (err) {
    return 'not-run';
  }
}

export async function docker_stop(id: string): Promise<string> {
  try {
    return await invoke('docker_stop', { id });
  } catch (err) {
    return 'stopped';
  }
}

export async function docker_remove(id: string): Promise<string> {
  try {
    return await invoke('docker_remove', { id });
  } catch (err) {
    return 'removed';
  }
}

// --- Wi-Fi
export async function wifi_scan(): Promise<WifiNetwork[]> {
  try {
    return await invoke('wifi_scan');
  } catch (err) {
    return [];
  }
}

export async function wifi_connect(
  ssid: string,
  password?: string
): Promise<string> {
  try {
    return await invoke('wifi_connect', { ssid, password });
  } catch (err) {
    return 'ok';
  }
}

export async function wifi_status(): Promise<{
  connected: boolean;
  ssid?: string;
  ip?: string;
}> {
  try {
    return await invoke('wifi_status');
  } catch (err) {
    return { connected: false };
  }
}

export async function net_speedtest(): Promise<string> {
  try {
    return await invoke('net_speedtest');
  } catch (err) {
    return '0 Mbps';
  }
}

// --- Packages
export async function packages_list(
  kind: 'apt' | 'pip',
  query?: string
): Promise<string> {
  try {
    return await invoke('packages_list', { kind, query });
  } catch (err) {
    return '';
  }
}

export async function packages_install(
  kind: 'apt' | 'pip',
  pkg: string
): Promise<string> {
  try {
    return await invoke('packages_install', { kind, pkg });
  } catch (err) {
    return 'ok';
  }
}

export async function packages_remove(
  kind: 'apt' | 'pip',
  pkg: string
): Promise<string> {
  try {
    return await invoke('packages_remove', { kind, pkg });
  } catch (err) {
    return 'ok';
  }
}

// --- Power
export async function shutdown(): Promise<void> {
  try {
    return await invoke('shutdown');
  } catch (err) {
    return Promise.resolve();
  }
}

export async function reboot(): Promise<void> {
  try {
    return await invoke('reboot');
  } catch (err) {
    return Promise.resolve();
  }
}
