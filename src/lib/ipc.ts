// Frontend IPC wrappers. For now, provide stubs that reject as "Not implemented"
// and mirror the API Surface defined in PLAN.md. These will be wired to Tauri invoke later.

import { SshConfig, SysInfo, WifiNetwork } from './types';

// Connection
export async function connect(_config: SshConfig): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function disconnect(): Promise<void> {
  return Promise.reject('Not implemented');
}

// System
export async function get_sys_info(): Promise<SysInfo> {
  return Promise.reject('Not implemented');
}

export async function get_power_mode(): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function set_power_mode(_mode: number): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function start_tegrastats_stream(): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function stop_tegrastats_stream(): Promise<void> {
  return Promise.reject('Not implemented');
}

// Terminal
export async function terminal_open(
  _id: string,
  _cols: number,
  _rows: number
): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function terminal_write(
  _id: string,
  _data: string
): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function terminal_resize(
  _id: string,
  _cols: number,
  _rows: number
): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function terminal_close(_id: string): Promise<void> {
  return Promise.reject('Not implemented');
}

// Files
export type DirEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
};

export async function list_dir(_path: string): Promise<DirEntry[]> {
  return Promise.reject('Not implemented');
}

export async function read_file(_path: string): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function write_file(
  _path: string,
  _content: string
): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function rename(_from: string, _to: string): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function remove(_path: string): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function mk_dir(_path: string): Promise<void> {
  return Promise.reject('Not implemented');
}

// Docker
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
  return Promise.reject('Not implemented');
}

export async function docker_list_containers(): Promise<DockerContainer[]> {
  return Promise.reject('Not implemented');
}

export async function docker_run(
  _image: string,
  _args?: string
): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function docker_stop(_id: string): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function docker_remove(_id: string): Promise<string> {
  return Promise.reject('Not implemented');
}

// Wi-Fi
export async function wifi_scan(): Promise<WifiNetwork[]> {
  return Promise.reject('Not implemented');
}

export async function wifi_connect(
  _ssid: string,
  _password?: string
): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function wifi_status(): Promise<{
  connected: boolean;
  ssid?: string;
  ip?: string;
}> {
  return Promise.reject('Not implemented');
}

export async function net_speedtest(): Promise<string> {
  return Promise.reject('Not implemented');
}

// Packages
export async function packages_list(
  _kind: 'apt' | 'pip',
  _query?: string
): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function packages_install(
  _kind: 'apt' | 'pip',
  _pkg: string
): Promise<string> {
  return Promise.reject('Not implemented');
}

export async function packages_remove(
  _kind: 'apt' | 'pip',
  _pkg: string
): Promise<string> {
  return Promise.reject('Not implemented');
}

// Power
export async function shutdown(): Promise<void> {
  return Promise.reject('Not implemented');
}

export async function reboot(): Promise<void> {
  return Promise.reject('Not implemented');
}
