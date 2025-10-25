import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { Device } from '@/types/db.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';

export const addDeviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export type AddDeviceForm = z.infer<typeof addDeviceSchema>;

export const useAddDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.ADD_DEVICE],
    mutationFn: async (data: AddDeviceForm) =>
      (await invoke(IpcChannelEnum.ADD_DEVICE, data)) as Device,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.LIST_DEVICES],
      });
    },
  });
};
