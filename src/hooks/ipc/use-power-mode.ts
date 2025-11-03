import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

export const useGetPowerMode = (deviceId: number) => {
  return useQuery({
    queryKey: [IpcChannelEnum.GET_POWER_MODE, deviceId],
    queryFn: async () => {
      return await invoke<string>(IpcChannelEnum.GET_POWER_MODE, {
        deviceId,
      });
    },
    enabled: !!deviceId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useSetPowerMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      mode,
    }: {
      deviceId: number;
      mode: number;
    }) => {
      return await invoke<void>(IpcChannelEnum.SET_POWER_MODE, {
        deviceId,
        mode,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Power mode changed to ${variables.mode}`);
      queryClient.invalidateQueries({
        queryKey: [IpcChannelEnum.GET_POWER_MODE, variables.deviceId],
      });
    },
    onError: (error) => {
      toast.error(`Failed to set power mode: ${error}`);
    },
  });
};
