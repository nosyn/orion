import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/stores/app.store';

export const useConnectDevice = () => {
  const { addSession } = useAppStore((s) => ({
    addSession: s.addSession,
  }));

  return useMutation({
    mutationKey: [IpcChannelEnum.CONNECT_DEVICE],
    mutationFn: async (deviceId: number) => {
      const token = (await invoke<string>(IpcChannelEnum.CONNECT_DEVICE, {
        deviceId,
      })) as string;

      addSession({
        token,
        deviceId,
      });

      return token;
    },
    onSuccess: () => toast.success('Connected'),
    onError: (err) => {
      const msg =
        typeof err === 'string'
          ? err
          : (err as any)?.message || 'Failed to connect';
      toast.error(msg);
    },
  });
};
