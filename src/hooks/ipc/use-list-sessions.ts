import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export const useListSessions = () => {
  return useQuery({
    queryKey: [IpcChannelEnum.LIST_SESSIONS],
    queryFn: async () =>
      (await invoke(IpcChannelEnum.LIST_SESSIONS)) as string[],
    refetchOnWindowFocus: 'always',
    initialData: [],
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};
