import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';

export const useRemoveDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.REMOVE_DEVICE],
    mutationFn: async (deviceId: number) => {
      const result = await invoke<string>(IpcChannelEnum.REMOVE_DEVICE, {
        deviceId,
      });

      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.LIST_SESSIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.LIST_DEVICES],
      });

      return result;
    },
    onSuccess: (deviceId) =>
      toast.success(`Removed device ${deviceId}`, {
        id: `device-${deviceId}`,
      }),
    onError: (err) => {
      const msg =
        typeof err === 'string'
          ? err
          : (err as any)?.message || 'Failed to connect';
      toast.error(msg);
    },
  });
};
