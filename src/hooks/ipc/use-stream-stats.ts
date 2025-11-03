import { IpcChannelEnum } from '@/common/enum/ipc-channel.enum';
import { invoke, Channel } from '@tauri-apps/api/core';
import * as React from 'react';

type UseStreamStatsOptions = {
  deviceId: string;
  intervalMs?: number;
  enabled?: boolean;
  onStat?: (stat: StatPoint) => void;
};

/**
 * Efficient hook for streaming device stats using Tauri Channels.
 * Channels are designed for high-throughput streaming and automatically
 * handle cleanup when the component unmounts or the channel is closed.
 */
export function useStreamStats({
  deviceId,
  intervalMs = 1000,
  enabled = false,
  onStat,
}: UseStreamStatsOptions) {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Use refs to avoid effect re-runs when callbacks change
  const onStatRef = React.useRef(onStat);
  React.useEffect(() => {
    onStatRef.current = onStat;
  }, [onStat]);

  React.useEffect(() => {
    if (!enabled || !deviceId) {
      setIsStreaming(false);
      return;
    }

    let isActive = true;

    const startStream = async () => {
      try {
        // Create a channel for receiving stats
        const onStatChannel = new Channel<StatPoint>();
        onStatChannel.onmessage = (stat) => {
          if (onStatRef.current) {
            onStatRef.current(stat);
          }
        };

        // Start streaming - this will keep sending data through the channel
        await invoke(IpcChannelEnum.STREAM_STATS, {
          token: deviceId,
          deviceId: Number(deviceId),
          intervalMs,
          onStat: onStatChannel,
        });

        if (!isActive) return;

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
        await invoke(IpcChannelEnum.STOP_STREAM_STATS, {
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
      stopStream();
    };
  }, [deviceId, enabled, intervalMs]); // onStat not in deps - using ref

  return {
    isStreaming,
    error,
  };
}
