import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { invoke } from '@tauri-apps/api/core';
import { useQuery } from '@tanstack/react-query';
import { Device } from '@/types/db.type';

export const useGetDevices = () => {
  return useQuery({
    queryKey: [IpcChannelEnum.LIST_DEVICES],
    queryFn: async () =>
      (await invoke(IpcChannelEnum.LIST_DEVICES)) as Device[],
    refetchOnWindowFocus: 'always',
  });
};
