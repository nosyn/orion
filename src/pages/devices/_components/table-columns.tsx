import { IconCircle, IconCircleFilled, IconLoader } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DeviceActions } from './device-actions';
import { DeviceNameCell } from './device-name-cell';

export const deviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['Connected', 'Disconnected', 'Loading']),
  notes: z.string().optional(),
  lastConnectedAt: z.number(),
});

export type Device = z.infer<typeof deviceSchema>;

export const columns: ColumnDef<Device>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.original.id}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <DeviceNameCell device={row.original} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className='w-32'>{row.original.description}</div>,
  },
  {
    accessorKey: 'notes',
    header: () => <div className='w-full'>Notes</div>,
    cell: ({ row }) => <div>{row.original.notes || '—'}</div>,
  },
  {
    accessorKey: 'connected',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-muted-foreground px-1.5'>
        {row.original.status === 'Loading' ? (
          <IconLoader />
        ) : row.original.status === 'Connected' ? (
          <IconCircleFilled className='fill-green-500 dark:fill-green-400' />
        ) : (
          <IconCircle className='fill-red-500 dark:fill-red-400' />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastConnectedAt',
    header: 'Last Connected At',
    cell: ({ row }) => (
      <div>
        {row.original.lastConnectedAt
          ? new Date(row.original.lastConnectedAt).toLocaleString()
          : '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DeviceActions deviceId={row.original.id} status={row.original.status} />
    ),
  },
];
