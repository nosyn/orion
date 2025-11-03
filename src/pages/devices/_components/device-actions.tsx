import { IconDotsVertical } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useConnectDevice } from '@/hooks/ipc/use-connect-device';
import { useDisconnectDevice } from '@/hooks/ipc/use-disconnect-device';
import { useRemoveDevice } from '@/hooks/ipc/use-remove-device';

export function DeviceActions({
  deviceId,
  status,
}: {
  deviceId: number;
  status: 'Connected' | 'Disconnected' | 'Loading';
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
          size='icon'
        >
          <IconDotsVertical />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-32'>
        {status === 'Disconnected' && (
          <ConnectDeviceMenuItem deviceId={deviceId} />
        )}
        <DropdownMenuSeparator />
        {status === 'Connected' && (
          <DisconnectDeviceMenuItem deviceId={deviceId} />
        )}
        <RemoveDeviceMenuItem deviceId={deviceId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ConnectDeviceMenuItem({ deviceId }: { deviceId: number }) {
  const { mutate: connectDevice, isPending: isConnectingDevice } =
    useConnectDevice();

  return (
    <DropdownMenuItem
      onClick={() => {
        connectDevice(deviceId);
      }}
      disabled={isConnectingDevice}
    >
      {isConnectingDevice ? (
        <div>
          <Spinner /> Connecting…
        </div>
      ) : (
        'Connect'
      )}
    </DropdownMenuItem>
  );
}

function DisconnectDeviceMenuItem({ deviceId }: { deviceId: number }) {
  const { mutate: disconnectDevice, isPending: isDisconnectingDevice } =
    useDisconnectDevice();

  return (
    <DropdownMenuItem
      variant='destructive'
      onClick={() => {
        disconnectDevice(deviceId);
      }}
      disabled={isDisconnectingDevice}
    >
      {isDisconnectingDevice ? (
        <div>
          <Spinner /> Disconnecting…
        </div>
      ) : (
        'Disconnect'
      )}
    </DropdownMenuItem>
  );
}

function RemoveDeviceMenuItem({ deviceId }: { deviceId: number }) {
  const { mutate: removeDevice, isPending: isRemovingDevice } =
    useRemoveDevice();

  return (
    <DropdownMenuItem
      variant='destructive'
      onClick={() => {
        removeDevice(deviceId);
      }}
      disabled={isRemovingDevice}
    >
      {isRemovingDevice ? (
        <div>
          <Spinner /> Removing…
        </div>
      ) : (
        'Remove'
      )}
    </DropdownMenuItem>
  );
}
