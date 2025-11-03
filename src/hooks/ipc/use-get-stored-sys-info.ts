import { useQuery } from '@tanstack/react-query';
import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { invoke } from '@tauri-apps/api/core';

/**
 * Hook to get system information from the local database for a specific device.
 * This reads cached system info that was previously fetched via fetch_and_store_sys_info.
 * Use this to display system info without querying the remote device.
 */
export const useGetStoredSystemInfo = (deviceId: number) => {
  return useQuery({
    queryKey: [IpcChannelEnum.GET_STORED_SYS_INFO, deviceId],
    queryFn: async () => {
      return await invoke<SystemInfo | null>(
        IpcChannelEnum.GET_STORED_SYS_INFO,
        {
          deviceId,
        }
      );
    },
    enabled: !!deviceId,
  });
};
