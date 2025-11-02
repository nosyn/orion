import { useListDevices } from '@/hooks/ipc/use-list-devices';
import { useListSessions } from '@/hooks/ipc/use-list-sessions';
import { DataTable } from './data-table';

export function DevicesPage() {
  const { data: sessions, isLoading: isLoadingSessions } = useListSessions();
  const { data: devices, isLoading } = useListDevices();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!devices) {
    return <div>Error</div>;
  }

  return (
    <div>
      <DataTable
        data={devices.map((device) => {
          console.log(
            'device:',
            device.id,
            sessions.includes(String(device.id)),
            isLoadingSessions
              ? 'Loading'
              : sessions.includes(String(device.id))
              ? 'Connected'
              : 'Disconnected'
          );
          return {
            id: device.id,
            name: device.name,
            description: device.description ?? '—',
            status: isLoadingSessions
              ? 'Loading'
              : sessions.includes(String(device.id))
              ? 'Connected'
              : 'Disconnected',
            serialNumber: device.serialNumber ?? '—',
            lastConnectedAt: device?.lastConnectedAt ?? 0,
          };
        })}
      />
    </div>
  );
}
