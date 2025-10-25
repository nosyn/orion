import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AddDeviceForm,
  addDeviceSchema,
  useAddDevice,
} from '@/hooks/ipc/use-add-device';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircleIcon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const initialValues: AddDeviceForm = { name: '', description: '' };

export const AddDeviceButton = () => {
  const form = useForm<AddDeviceForm>({
    defaultValues: initialValues,
    resolver: zodResolver(addDeviceSchema),
  });
  const { mutate } = useAddDevice();
  const [open, setOpen] = React.useState(false);

  function onAddDevice(values: AddDeviceForm) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Device added successfully');
        form.reset();
        setOpen(false);
      },
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        form.reset(initialValues);
        setOpen(open);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant='ghost' size='icon-sm' aria-label='Submit'>
          <PlusCircleIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddDevice)}
            className='grid grid-cols-1 gap-2'
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Add a Device</AlertDialogTitle>
              <AlertDialogDescription>
                This will add a new device to your list. You can manage it
                later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Description (optional)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type='submit'>Add</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
