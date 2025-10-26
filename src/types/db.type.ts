export type Device = {
  id: number;
  name: string;
  description?: string | null;
  serialNumber?: string | null;
  cpuModel?: string | null;
  gpuModel?: string | null;
  totalRamMb?: number | null;
  totalStorageMb?: number | null;
  os?: string | null;
  arch?: string | null;
  hostname?: string | null;
  macAddress?: string | null;
  ipAddress?: string | null;
  notes?: string | null;
  createdAt: number;
  updatedAt: number;
};
