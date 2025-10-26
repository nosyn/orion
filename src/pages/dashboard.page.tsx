import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  get_stats,
  list_devices,
  record_stat,
  start_stats_stream,
  stop_stats_stream,
} from '@/lib/ipc';
import { useAppStore } from '@/stores/app.store';
import { listen } from '@tauri-apps/api/event';
import * as React from 'react';
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

type Point = StatPoint & {
  gpu_util?: number | null;
  gpu_temp_c?: number | null;
};

const chartConfig = {
  cpu: { label: 'CPU %', color: 'var(--chart-1)' },
  mem: { label: 'Mem %', color: 'var(--chart-2)' },
  gpu: { label: 'GPU %', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const RANGES: Array<{
  key: string;
  label: string;
  windowMs: number;
  limit: number;
}> = [
  { key: '2m', label: '2m', windowMs: 2 * 60_000, limit: 120 },
  { key: '10m', label: '10m', windowMs: 10 * 60_000, limit: 600 },
  { key: '1h', label: '1h', windowMs: 60 * 60_000, limit: 3600 },
];

export function DashboardPage() {
  const { currentSession, sessions } = useAppStore((s) => ({
    currentSession: s.currentSession,
    sessions: s.sessions,
  }));
  const [deviceId, setDeviceId] = React.useState<number | null>(null);
  const [points, setPoints] = React.useState<Point[]>([]);
  const [rangeKey, setRangeKey] = React.useState<string>('2m');
  const [liveBg, setLiveBg] = React.useState<boolean>(false);

  // Resolve device
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const devices = await list_devices();
      const did =
        devices.find((d) => d.name === 'default')?.id ?? devices[0]?.id ?? null;
      if (!mounted) return;
      setDeviceId(did ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, [currentSession]);

  // Load initial window
  const reloadWindow = React.useCallback(async (did: number, rk: string) => {
    const range = RANGES.find((r) => r.key === rk)!;
    const end = Date.now();
    const start = end - range.windowMs;
    const data = await get_stats(did, {
      limit: range.limit,
      start_ts: start,
      end_ts: end,
    });
    setPoints(data as Point[]);
  }, []);

  React.useEffect(() => {
    if (!deviceId) return;
    reloadWindow(deviceId, rangeKey);
  }, [deviceId, rangeKey, reloadWindow]);

  // Live: either background stream events or manual interval polling
  React.useEffect(() => {
    if (!currentSession || !deviceId) return;
    let unlisten: (() => void) | null = null;
    let interval: number | null = null;
    (async () => {
      if (liveBg) {
        await start_stats_stream(currentSession, deviceId, 1000);
        const off = await listen('tegrastats://point', (e) => {
          const p = e.payload as any as Point;
          if ((p as any).device_id !== deviceId) return;
          setPoints((prev) => [
            ...prev.slice(-RANGES.find((r) => r.key === rangeKey)!.limit + 1),
            p,
          ]);
        });
        unlisten = () => off();
      } else {
        interval = window.setInterval(async () => {
          try {
            const p = await record_stat(currentSession, deviceId);
            setPoints((prev) => [
              ...prev.slice(-RANGES.find((r) => r.key === rangeKey)!.limit + 1),
              p as Point,
            ]);
          } catch {}
        }, 1000);
      }
    })();
    return () => {
      if (unlisten) unlisten();
      if (interval) window.clearInterval(interval);
      if (liveBg && currentSession) stop_stats_stream(currentSession);
    };
  }, [currentSession, deviceId, liveBg, rangeKey]);

  // Prepare chart data
  const chartData = React.useMemo(
    () =>
      points.map((p) => ({
        ts: p.ts,
        cpu: Number(p.cpu?.toFixed(2) || 0),
        mem: p.ram_total_mb
          ? Number(((p.ram_used_mb / p.ram_total_mb) * 100).toFixed(2))
          : 0,
        gpu: p.gpu_util ?? null,
      })),
    [points]
  );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
        <div className='flex items-center gap-2'>
          <div className='flex rounded border bg-background'>
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRangeKey(r.key)}
                className={`px-3 py-1 text-sm ${
                  rangeKey === r.key ? 'bg-muted' : ''
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={liveBg}
              onChange={(e) => setLiveBg(e.target.checked)}
            />
            Live (background)
          </label>
        </div>
      </div>

      {!currentSession && (
        <p className='text-sm text-muted-foreground'>
          Connect to a device to begin streaming stats.
        </p>
      )}

      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>
              System Utilization - Device{' '}
              {sessions.get(currentSession || '')?.deviceId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig as ChartConfig}
              className='aspect-auto h-[300px] w-full'
            >
              <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='ts'
                  tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey='cpu'
                  type='monotone'
                  stroke='var(--color-cpu)'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey='mem'
                  type='monotone'
                  stroke='var(--color-mem)'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey='gpu'
                  type='monotone'
                  stroke='var(--color-gpu)'
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
