import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import * as React from 'react';

type StatPointWithDevice = StatPoint & {
  device_id?: number;
};

type UseStatsStreamingOptions = {
  deviceId: string;
  intervalMs?: number;
  enabled?: boolean;
  onPoint?: (point: StatPointWithDevice) => void;
};

/**
 * Custom hook for managing stats streaming from a device.
 * Handles starting/stopping the stream and listening for events.
 */
export function useStatsStreaming({
  deviceId,
  intervalMs = 1000,
  enabled = false,
  onPoint,
}: UseStatsStreamingOptions) {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !deviceId) {
      setIsStreaming(false);
      return;
    }

    let unlisten: UnlistenFn | null = null;
    let isActive = true;

    const startStream = async () => {
      try {
        // Start the backend stream
        await invoke(IpcChannelEnum.START_STATS_STREAM, {
          token: deviceId,
          device_id: Number(deviceId),
          interval_ms: intervalMs,
        });

        if (!isActive) return;

        // Listen for tegrastats events
        unlisten = await listen<StatPointWithDevice>(
          'tegrastats://point',
          (event) => {
            const point = event.payload;

            // Filter events for this specific device
            if (String(point.device_id) !== deviceId) return;

            if (onPoint) {
              onPoint(point);
            }
          }
        );

        setIsStreaming(true);
        setError(null);
      } catch (err) {
        if (!isActive) return;

        const message =
          typeof err === 'string'
            ? err
            : (err as any)?.message || 'Failed to start stats stream';
        setError(message);
        setIsStreaming(false);
      }
    };

    const stopStream = async () => {
      try {
        await invoke(IpcChannelEnum.STOP_STATS_STREAM, {
          token: deviceId,
        });
      } catch (err) {
        console.warn('Error stopping stream:', err);
      }
    };

    startStream();

    return () => {
      isActive = false;
      setIsStreaming(false);

      if (unlisten) {
        unlisten();
      }

      stopStream();
    };
  }, [deviceId, enabled, intervalMs, onPoint]);

  return {
    isStreaming,
    error,
  };
}
