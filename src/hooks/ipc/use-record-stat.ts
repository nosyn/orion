import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

type StatPointWithDevice = StatPoint & {
  device_id: number;
};

export const useRecordStat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.RECORD_STAT],
    mutationFn: async ({ deviceId }: { deviceId: string }) => {
      return (await invoke(IpcChannelEnum.RECORD_STAT, {
        token: deviceId, // Backend uses token parameter
        device_id: Number(deviceId),
      })) as StatPointWithDevice;
    },
    onSuccess: () => {
      // Optionally invalidate stats queries
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.GET_STATS],
      });
    },
  });
};
