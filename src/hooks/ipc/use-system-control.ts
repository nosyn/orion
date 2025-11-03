import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

export const useShutdown = () => {
  return useMutation({
    mutationFn: async (deviceId: number) => {
      return await invoke<void>(IpcChannelEnum.SHUTDOWN, {
        deviceId,
      });
    },
    onSuccess: (_, deviceId) => {
      toast.success(`Shutdown command sent to device ${deviceId}`, {
        id: `device-${deviceId}`,
      });
    },
    onError: (error) => {
      toast.error(`Failed to shutdown: ${error}`);
    },
  });
};

export const useReboot = () => {
  return useMutation({
    mutationFn: async (deviceId: number) => {
      return await invoke<void>(IpcChannelEnum.REBOOT, {
        deviceId,
      });
    },
    onSuccess: (_, deviceId) => {
      toast.success(`Reboot command sent to device ${deviceId}`, {
        id: `device-${deviceId}`,
      });
    },
    onError: (error) => {
      toast.error(`Failed to reboot: ${error}`);
    },
  });
};
