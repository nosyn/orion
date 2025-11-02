import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';

export const useDisconnectDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [IpcChannelEnum.DISCONNECT_DEVICE],
    mutationFn: async (deviceId: number) => {
      const result = await invoke<string>(IpcChannelEnum.DISCONNECT_DEVICE, {
        deviceId,
      });

      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.LIST_SESSIONS],
      });

      return result;
    },
    onSuccess: (deviceId) =>
      toast.success(`Disconnected device ${deviceId}`, {
        id: `device-${deviceId}`,
      }),
    onError: (err) => {
      const msg =
        typeof err === 'string'
          ? err
          : (err as any)?.message || 'Failed to disconnect';
      toast.error(msg);
    },
  });
};
