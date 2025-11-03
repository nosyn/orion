import { IconCircle, IconCircleFilled, IconLoader } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { SystemInfoSection } from './system-info-section';
import { SystemControlSection } from './system-control-section';
import { Device } from './table-columns';

export function DeviceNameCell({ device }: { device: Device }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button variant='link' className='text-foreground w-fit px-0 text-left'>
          {device.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>{device.name}</DrawerTitle>
          <DrawerDescription>Device ID: {device.id}</DrawerDescription>
        </DrawerHeader>

        <Tabs
          defaultValue='info'
          className='flex flex-1 flex-col overflow-hidden'
        >
          <TabsList className='mx-4 grid w-auto grid-cols-3'>
            <TabsTrigger value='info'>Info</TabsTrigger>
            <TabsTrigger value='system'>System</TabsTrigger>
            <TabsTrigger value='details'>Details</TabsTrigger>
          </TabsList>

          <div className='flex-1 overflow-y-auto px-4 pb-4'>
            {/* System Info Tab */}
            <TabsContent value='info' className='mt-4 space-y-4'>
              <SystemInfoSection
                deviceId={device.id}
                isConnected={device.status === 'Connected'}
              />
            </TabsContent>

            {/* System Control Tab */}
            <TabsContent value='system' className='mt-4 space-y-4'>
              <SystemControlSection
                deviceId={device.id}
                isConnected={device.status === 'Connected'}
              />
            </TabsContent>

            {/* Device Details Tab */}
            <TabsContent value='details' className='mt-4 space-y-4'>
              <div className='space-y-3'>
                <h3 className='text-base font-semibold'>Device Details</h3>
                <div className='bg-muted/50 grid gap-3 rounded-lg border p-4'>
                  <div>
                    <Label className='text-muted-foreground text-xs'>
                      Description
                    </Label>
                    <p className='font-medium'>{device.description}</p>
                  </div>
                  {device.notes && device.notes !== '—' && (
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Notes
                      </Label>
                      <p className='text-sm'>{device.notes}</p>
                    </div>
                  )}
                  <Separator />
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Status
                      </Label>
                      <div className='mt-1'>
                        <Badge
                          variant='outline'
                          className='text-muted-foreground px-1.5'
                        >
                          {device.status === 'Loading' ? (
                            <IconLoader className='mr-1 size-3' />
                          ) : device.status === 'Connected' ? (
                            <IconCircleFilled className='mr-1 size-3 fill-green-500 dark:fill-green-400' />
                          ) : (
                            <IconCircle className='mr-1 size-3 fill-red-500 dark:fill-red-400' />
                          )}
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Last Connected
                      </Label>
                      <p className='text-xs'>
                        {device.lastConnectedAt > 0
                          ? new Date(device.lastConnectedAt).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline'>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
