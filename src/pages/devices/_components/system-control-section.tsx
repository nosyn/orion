import { Info, Power, RotateCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetPowerMode, useSetPowerMode } from '@/hooks/ipc/use-power-mode';
import { useReboot, useShutdown } from '@/hooks/ipc/use-system-control';
import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';

const POWER_MODES = [
  { value: '0', label: 'MAXN', description: 'Maximum performance' },
  { value: '1', label: '5W', description: 'Low power mode' },
  { value: '2', label: '10W', description: 'Balanced mode' },
  { value: '3', label: '15W', description: 'High performance' },
];

export function SystemControlSection({
  deviceId,
  isConnected,
}: {
  deviceId: number;
  isConnected: boolean;
}) {
  const [selectedMode, setSelectedMode] = React.useState<string>('');
  const [showPowerModeDialog, setShowPowerModeDialog] = React.useState(false);

  const { data: powerMode, isLoading: isPowerModeLoading } =
    useGetPowerMode(deviceId);
  const setPowerModeMutation = useSetPowerMode();
  const shutdownMutation = useShutdown();
  const rebootMutation = useReboot();

  const handlePowerModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setShowPowerModeDialog(true);
  };

  const confirmPowerModeChange = () => {
    setPowerModeMutation.mutate(
      { deviceId, mode: parseInt(selectedMode) },
      {
        onSuccess: () => setShowPowerModeDialog(false),
      }
    );
  };

  const handleShutdown = () => {
    shutdownMutation.mutate(deviceId);
  };

  const handleReboot = () => {
    rebootMutation.mutate(deviceId);
  };

  if (!isConnected) {
    return (
      <div className='bg-muted/30 rounded-lg border border-dashed p-6 text-center'>
        <p className='text-muted-foreground text-sm'>
          Device must be connected to access system controls.
        </p>
      </div>
    );
  }

  const selectedModeInfo = POWER_MODES.find((m) => m.value === selectedMode);

  return (
    <div className='space-y-4'>
      {/* Power Mode Control */}
      <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
        <div className='flex items-center gap-2'>
          <Zap className='h-4 w-4' />
          <h4 className='font-semibold'>Power Mode</h4>
          {isPowerModeLoading ? (
            <Spinner />
          ) : (
            powerMode && (
              <Badge variant='default' className='shrink-0'>
                {powerMode}
              </Badge>
            )
          )}
        </div>
        <div className='flex items-center gap-3'>
          <Select
            value={powerMode || undefined}
            onValueChange={handlePowerModeSelect}
            disabled={isPowerModeLoading || setPowerModeMutation.isPending}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select power mode' />
            </SelectTrigger>
            <SelectContent>
              {POWER_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{mode.label}</span>
                    <span className='text-xs text-muted-foreground'>
                      {mode.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-start gap-2 rounded-md bg-blue-50 p-2 dark:bg-blue-950/30'>
          <Info className='mt-0.5 h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400' />
          <p className='text-xs text-blue-700 dark:text-blue-300'>
            Available modes depend on your Jetson model
          </p>
        </div>
      </div>

      <Separator />

      {/* System Operations */}
      <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
        <div className='flex items-center gap-2'>
          <Power className='h-4 w-4' />
          <h4 className='font-semibold'>System Operations</h4>
        </div>
        <div className='flex flex-wrap gap-2'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                disabled={shutdownMutation.isPending}
                className='gap-2'
              >
                <Power className='h-3 w-3' />
                Shutdown
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Shutdown</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately shutdown the device. You will need
                  physical access to power it back on.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleShutdown}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Shutdown
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={rebootMutation.isPending}
                className='gap-2'
              >
                <RotateCw className='h-3 w-3' />
                Reboot
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Reboot</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restart the device. All running processes will be
                  terminated. The device should come back online in a few
                  minutes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReboot}>
                  Reboot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className='flex items-start gap-2 rounded-md bg-amber-50 p-2 dark:bg-amber-950/30'>
          <Info className='mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400' />
          <p className='text-xs text-amber-700 dark:text-amber-300'>
            These operations require sudo access without password prompt
          </p>
        </div>
      </div>

      {/* Power Mode Confirmation Dialog */}
      <AlertDialog
        open={showPowerModeDialog}
        onOpenChange={setShowPowerModeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Power Mode Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the power mode to{' '}
              <strong>{selectedModeInfo?.label}</strong> (
              {selectedModeInfo?.description})?
              <br />
              <br />
              This will affect the device's performance and power consumption.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPowerModeChange}
              disabled={setPowerModeMutation.isPending}
            >
              {setPowerModeMutation.isPending ? 'Changing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
