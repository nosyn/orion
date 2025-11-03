import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useListSessions } from '@/hooks/ipc/use-list-sessions';
import { useStreamStats } from '@/hooks/ipc/use-stream-stats';
import * as React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, HardDrive, Thermometer, Zap } from 'lucide-react';

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

const cpuChartConfig = {
  cpu: { label: 'CPU %', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const memoryChartConfig = {
  used: { label: 'Used MB', color: 'hsl(var(--chart-2))' },
  total: { label: 'Total MB', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;

const gpuChartConfig = {
  gpu: { label: 'GPU %', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

const temperatureChartConfig = {
  temp: { label: 'Temperature °C', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

function DeviceCard({ deviceId }: { deviceId: string }) {
  const [points, setPoints] = React.useState<StatPoint[]>([]);
  const [rangeKey, setRangeKey] = React.useState<string>('2m');
  const [isStreamingEnabled, setIsStreamingEnabled] =
    React.useState<boolean>(true);

  const range = RANGES.find((r) => r.key === rangeKey)!;

  // Use the new efficient channel-based streaming
  const { isStreaming, error } = useStreamStats({
    deviceId,
    intervalMs: 1000,
    enabled: isStreamingEnabled,
    onStat: React.useCallback(
      (stat: StatPoint) => {
        setPoints((prev) => {
          const newPoints = [...prev, stat];
          // Keep only the most recent points based on range
          return newPoints.slice(-range.limit);
        });
      },
      [range.limit]
    ),
  });

  // Show error toast if streaming fails
  React.useEffect(() => {
    if (error) {
      console.error('Stats streaming error:', error);
    }
  }, [error]);

  // Prepare chart data
  const cpuData = React.useMemo(
    () =>
      points.map((p) => ({
        ts: p.ts,
        cpu: Number(p.cpu?.toFixed(2) || 0),
      })),
    [points]
  );

  const memoryData = React.useMemo(
    () =>
      points.map((p) => ({
        ts: p.ts,
        used: p.ramUsedMb,
        total: p.ramTotalMb,
        percentage: p.ramTotalMb
          ? Number(((p.ramUsedMb / p.ramTotalMb) * 100).toFixed(2))
          : 0,
      })),
    [points]
  );

  const gpuData = React.useMemo(
    () =>
      points
        .filter((p) => p.gpuUtil != null)
        .map((p) => ({
          ts: p.ts,
          gpu: Number(p.gpuUtil?.toFixed(2) || 0),
        })),
    [points]
  );

  const temperatureData = React.useMemo(
    () =>
      points
        .filter((p) => p.gpuTempC != null)
        .map((p) => ({
          ts: p.ts,
          temp: Number(p.gpuTempC?.toFixed(1) || 0),
        })),
    [points]
  );

  // Current stats
  const currentStats = points[points.length - 1];
  const cpuUsage = currentStats?.cpu?.toFixed(1) || 'N/A';
  const memUsage = currentStats
    ? ((currentStats.ramUsedMb / currentStats.ramTotalMb) * 100).toFixed(1)
    : 'N/A';
  const gpuUsage = currentStats?.gpuUtil?.toFixed(1) || 'N/A';
  const temperature = currentStats?.gpuTempC?.toFixed(1) || 'N/A';

  return (
    <div className='space-y-4'>
      {/* Header with controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-semibold'>Device {deviceId}</h2>
          <Badge variant={isStreaming ? 'default' : 'secondary'}>
            {isStreaming ? 'Live' : 'Paused'}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex rounded border bg-background'>
            {RANGES.map((r) => (
              <Button
                key={r.key}
                onClick={() => setRangeKey(r.key)}
                variant='ghost'
                size='sm'
                className={`rounded-none ${
                  rangeKey === r.key ? 'bg-muted' : ''
                }`}
              >
                {r.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
            variant={isStreaming ? 'destructive' : 'default'}
            size='sm'
          >
            {isStreaming ? 'Stop' : 'Start'} Stream
          </Button>
        </div>
      </div>

      {/* Current Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>CPU Usage</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{cpuUsage}%</div>
            <p className='text-xs text-muted-foreground'>
              {points.length} data points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Usage</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{memUsage}%</div>
            <p className='text-xs text-muted-foreground'>
              {currentStats?.ramUsedMb || 0} / {currentStats?.ramTotalMb || 0}{' '}
              MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>GPU Usage</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {gpuUsage === 'N/A' ? 'N/A' : `${gpuUsage}%`}
            </div>
            <p className='text-xs text-muted-foreground'>
              {gpuData.length > 0 ? 'Active' : 'No GPU data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Temperature</CardTitle>
            <Thermometer className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {temperature === 'N/A' ? 'N/A' : `${temperature}°C`}
            </div>
            <p className='text-xs text-muted-foreground'>
              {temperatureData.length > 0 ? 'GPU Temperature' : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* CPU Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>CPU Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={cpuChartConfig}
              className='aspect-auto h-[200px] w-full'
            >
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id='cpuGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='hsl(var(--chart-1))'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='hsl(var(--chart-1))'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='ts'
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type='monotone'
                  dataKey='cpu'
                  stroke='hsl(var(--chart-1))'
                  fill='url(#cpuGradient)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={memoryChartConfig}
              className='aspect-auto h-[200px] w-full'
            >
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='ts'
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === 'percentage') {
                          return [`${Number(value).toFixed(1)}%`, 'Usage'];
                        }
                        return [`${value} MB`, name];
                      }}
                    />
                  }
                />
                <Line
                  type='monotone'
                  dataKey='used'
                  stroke='hsl(var(--chart-2))'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='percentage'
                  stroke='hsl(var(--chart-5))'
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray='5 5'
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* GPU Chart */}
        {gpuData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>GPU Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={gpuChartConfig}
                className='aspect-auto h-[200px] w-full'
              >
                <AreaChart data={gpuData}>
                  <defs>
                    <linearGradient
                      id='gpuGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='hsl(var(--chart-3))'
                        stopOpacity={0.8}
                      />
                      <stop
                        offset='95%'
                        stopColor='hsl(var(--chart-3))'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='ts'
                    tickFormatter={(v) =>
                      new Date(v).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type='monotone'
                    dataKey='gpu'
                    stroke='hsl(var(--chart-3))'
                    fill='url(#gpuGradient)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Temperature Chart */}
        {temperatureData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>GPU Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={temperatureChartConfig}
                className='aspect-auto h-[200px] w-full'
              >
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='ts'
                    tickFormatter={(v) =>
                      new Date(v).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 'auto']}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value}°C`, 'Temperature']}
                      />
                    }
                  />
                  <Line
                    type='monotone'
                    dataKey='temp'
                    stroke='hsl(var(--chart-4))'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: sessions } = useListSessions();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Monitor your connected devices in real-time
          </p>
        </div>
      </div>

      {!sessions.length && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <Zap className='mb-4 h-12 w-12 text-muted-foreground' />
            <h3 className='mb-2 text-lg font-semibold'>
              No Active Connections
            </h3>
            <p className='text-center text-sm text-muted-foreground'>
              Connect to a device to begin streaming stats and monitoring system
              performance.
            </p>
          </CardContent>
        </Card>
      )}

      {sessions.map((deviceId) => (
        <DeviceCard key={deviceId} deviceId={deviceId} />
      ))}
    </div>
  );
}
