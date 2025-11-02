import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';

export const addDeviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  credential: z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.coerce.number().int().min(1).max(65535).default(22),
    username: z.string().min(1, 'Username is required'),
    auth_type: z.enum(['password', 'key']),
    password: z.string().optional().nullable(),
    private_key_path: z.string().optional().nullable(),
  }),
});

export type AddDeviceForm = z.infer<typeof addDeviceSchema>;

export const useAddDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.ADD_DEVICE],
    mutationFn: async (data: AddDeviceForm) => {
      return await invoke(IpcChannelEnum.ADD_DEVICE, data);
    },
    onSuccess: (deviceId) => {
      toast.success('Device added successfully', {
        id: `device-${deviceId}`,
      });
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.LIST_DEVICES],
      });
    },
    onError: (err) => {
      const msg =
        typeof err === 'string'
          ? err
          : (err as any)?.message || 'Failed to add device';
      toast.error(msg);
    },
  });
};
