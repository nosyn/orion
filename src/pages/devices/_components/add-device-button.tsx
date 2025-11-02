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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AddDeviceForm,
  addDeviceSchema,
  useAddDevice,
} from '@/hooks/ipc/use-add-device';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';
import { useForm, type Resolver } from 'react-hook-form';

const initialValues: AddDeviceForm = {
  name: '',
  description: '',
  credential: {
    host: '',
    port: 22,
    username: '',
    auth_type: 'password',
    password: '',
    private_key_path: '',
  },
};

export const AddDeviceButton = () => {
  const form = useForm<AddDeviceForm>({
    defaultValues: initialValues,
    resolver: zodResolver(
      addDeviceSchema
    ) as unknown as Resolver<AddDeviceForm>,
  });
  const { mutate, isPending } = useAddDevice();
  const [open, setOpen] = React.useState(false);

  function onAddDevice(values: AddDeviceForm) {
    mutate(values, {
      onSuccess: () => {
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
        <Button variant='outline' size='sm'>
          <IconPlus />
          <span className='hidden lg:inline'>Add Device</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddDevice as any)}
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

            <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
              <FormField
                control={form.control}
                name='credential.host'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder='192.168.1.10' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='credential.port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={65535}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              <FormField
                control={form.control}
                name='credential.username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='ubuntu' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='credential.auth_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auth Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select an auth type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Auth Types</SelectLabel>
                            <SelectItem value='password'>Password</SelectItem>
                            <SelectItem value='key'>SSH Key</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('credential.auth_type') === 'password' ? (
              <FormField
                control={form.control}
                name='credential.password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name='credential.private_key_path'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Private Key</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        type='file'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type='submit' isLoading={isPending}>
                Add
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
