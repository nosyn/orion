import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

type GetStatsOptions = {
  limit?: number;
  startTs?: number;
  endTs?: number;
};

export const useGetStats = (deviceId: number, options?: GetStatsOptions) => {
  return useQuery({
    queryKey: [IpcChannelEnum.GET_STATS, deviceId, options],
    queryFn: async () => {
      const { limit = 120, startTs, endTs } = options || {};
      return (await invoke(IpcChannelEnum.GET_STATS, {
        deviceId,
        limit,
        startTs,
        endTs,
      })) as StatPoint[];
    },
    enabled: typeof deviceId === 'number',
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};
