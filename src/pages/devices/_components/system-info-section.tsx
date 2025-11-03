import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useGetStoredSystemInfo } from '@/hooks/ipc/use-get-stored-sys-info';
import { useFetchAndStoreSystemInfo } from '@/hooks/ipc/use-fetch-and-store-sys-info';

export function SystemInfoSection({
  deviceId,
  isConnected,
}: {
  deviceId: number;
  isConnected: boolean;
}) {
  const { data: systemInfo, isLoading: isLoadingSystemInfo } =
    useGetStoredSystemInfo(deviceId);
  const { mutate: fetchSystemInfo, isPending: isFetchingSystemInfo } =
    useFetchAndStoreSystemInfo();

  const handleRefreshSystemInfo = () => {
    fetchSystemInfo(deviceId);
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-semibold'>System Information</h3>
        <Button
          size='sm'
          variant='outline'
          onClick={handleRefreshSystemInfo}
          disabled={isFetchingSystemInfo || !isConnected}
        >
          {isFetchingSystemInfo ? (
            <>
              <Spinner className='mr-2' /> Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {isLoadingSystemInfo ? (
        <div className='flex items-center gap-2 py-8 text-muted-foreground'>
          <Spinner /> Loading system information...
        </div>
      ) : systemInfo ? (
        <div className='bg-muted/50 grid gap-3 rounded-lg border p-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-muted-foreground text-xs'>Hostname</Label>
              <p className='font-medium'>{systemInfo.hostname}</p>
            </div>
            <div>
              <Label className='text-muted-foreground text-xs'>
                Operating System
              </Label>
              <p className='font-medium'>{systemInfo.os}</p>
            </div>
            <div>
              <Label className='text-muted-foreground text-xs'>Kernel</Label>
              <p className='font-medium'>{systemInfo.kernel}</p>
            </div>
            <div>
              <Label className='text-muted-foreground text-xs'>Uptime</Label>
              <p className='font-medium'>
                {formatUptime(systemInfo.uptimeSec)}
              </p>
            </div>
            {systemInfo.cuda && (
              <div>
                <Label className='text-muted-foreground text-xs'>
                  CUDA Version
                </Label>
                <p className='font-medium'>{systemInfo.cuda}</p>
              </div>
            )}
            {systemInfo.jetpack && (
              <div>
                <Label className='text-muted-foreground text-xs'>
                  JetPack Version
                </Label>
                <p className='font-medium'>{systemInfo.jetpack}</p>
              </div>
            )}
          </div>
          <Separator />
          <div>
            <Label className='text-muted-foreground text-xs'>
              Last Updated
            </Label>
            <p className='text-xs'>
              {systemInfo.updatedAt
                ? new Date(systemInfo.updatedAt).toLocaleString()
                : 'Never'}
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-muted/30 rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground text-sm'>
            No system information available.
            {isConnected && (
              <>
                <br />
                Click <strong>Refresh</strong> to fetch system details.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to format uptime in a human-readable way
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
