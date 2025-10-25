import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDevices } from '@/hooks/ipc/use-get-devices';
import { disconnect_token } from '@/lib/ipc';
import { useAppStore } from '@/stores/app.store';
import { AddDeviceButton } from './_components/add-device-button';

export function DevicesPage() {
  const sessions = useAppStore((s) => s.sessions);
  const { data: devices, isLoading } = useGetDevices();

  function deviceStatus(id: number): { connected: boolean; token?: string } {
    const entry = Object.values(sessions).find((s) => s.device_id === id);
    return entry
      ? { connected: true, token: entry.token }
      : { connected: false };
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!devices) {
    return <div>Error</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex gap-2 items-center'>
        <h1 className='text-xl font-semibold'>Devices</h1>
        <AddDeviceButton />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {/* Device cards */}
        {devices.map((d) => {
          const status = deviceStatus(d.id);
          return (
            <Card key={d.id}>
              <CardHeader>
                <div className='flex items-center justify-between gap-2'>
                  <CardTitle className='text-base'>{d.name}</CardTitle>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      status.connected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-sm text-muted-foreground'>
                  {d.description || '—'}
                </div>
                <div className='flex flex-wrap gap-2 pt-2'>
                  {status.connected ? (
                    <Button
                      variant='outline'
                      onClick={async () => {
                        if (status.token) await disconnect_token(status.token);
                      }}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button>Connect</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
