import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { invoke } from '@tauri-apps/api/core';

/**
 * Hook to fetch system information from a remote device via SSH.
 * This queries the device directly and saves the result to the database.
 * Use this when you need fresh system info from a connected device.
 */
export const useFetchAndStoreSystemInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.FETCH_AND_STORE_SYS_INFO],
    mutationFn: async (deviceId: number) => {
      return await invoke<SystemInfo>(IpcChannelEnum.FETCH_AND_STORE_SYS_INFO, {
        deviceId,
      });
    },
    onSuccess: (sysInfo) => {
      // Invalidate system info queries when we fetch new data
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.GET_STORED_SYS_INFO, sysInfo.deviceId],
      });
    },
  });
};
