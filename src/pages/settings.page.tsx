import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connect, save_credential, disconnect } from '@/lib/ipc';
import { useAppStore } from '@/stores/app.store';
import { cn } from '@/lib/utils';

const schema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce
    .number()
    .int()
    .positive('Port must be a positive integer')
    .default(22),
  username: z.string().min(1, 'Username is required'),
  authType: z.enum(['password', 'key']),
  password: z.string().optional(),
  privateKeyPath: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | null;

export function SettingsPage() {
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>(null);
  // server-side message displayed via connectionStatus or optimistic store

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { port: 22, authType: 'password' },
  });

  const authType = watch('authType');

  const onSubmit = async (data: FormValues) => {
    setConnectionStatus('connecting');
    try {
      // Cast to SshConfig shape
      await connect({
        host: data.host,
        port: Number(data.port),
        username: data.username,
        authType: data.authType as any,
        password: data.password,
        privateKeyPath: data.privateKeyPath,
      });

      // show success briefly
      // You may prefer to show a green toast here; for now we'll set serverMessage to success
      setConnectionStatus('connected');
    } catch (err) {
      console.error(err);
      setConnectionStatus('disconnected');
    }
  };

  const onSave = async (data: FormValues) => {
    try {
      const id = await save_credential({
        host: data.host,
        port: Number(data.port),
        username: data.username,
        authType: data.authType as any,
        password: data.password,
        privateKeyPath: data.privateKeyPath,
      });
      if (id && id > 0) {
        // refresh stored credentials
        const store = useAppStore.getState();
        // we will rely on app-level loader to refresh from backend; but set optimistic
        store.setCredentials([
          ...store.credentials,
          {
            id,
            host: data.host,
            port: Number(data.port),
            username: data.username,
            authType: data.authType as any,
            password: data.password,
            privateKeyPath: data.privateKeyPath,
          },
        ]);
      }
    } catch (e) {
      // ignore for now
    }
  };

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Settings</h1>
      <section className='space-y-2'>
        <h2 className='text-base font-medium'>
          Connection Wizard: {connectionStatus}
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='grid grid-cols-1 gap-3 max-w-xl'
        >
          <div className='grid gap-1'>
            <Label htmlFor='host'>Host</Label>
            <Input
              id='host'
              placeholder='192.168.1.100'
              {...register('host')}
            />
            {errors.host ? (
              <p className='text-sm text-red-600'>
                {(errors.host as any)?.message}
              </p>
            ) : null}
          </div>

          <div className='grid gap-1'>
            <Label htmlFor='port'>Port</Label>
            <Input id='port' type='number' {...register('port')} />
            {errors.port ? (
              <p className='text-sm text-red-600'>
                {(errors.port as any)?.message}
              </p>
            ) : null}
          </div>

          <div className='grid gap-1'>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              {...register('username')}
              placeholder='ubuntu'
            />
            {errors.username ? (
              <p className='text-sm text-red-600'>
                {(errors.username as any)?.message}
              </p>
            ) : null}
          </div>

          <div className='grid gap-1'>
            <Label>Auth Type</Label>
            <div className='flex gap-4'>
              <Label className='flex items-center gap-2 text-sm'>
                <input
                  type='radio'
                  value='password'
                  {...register('authType')}
                  defaultChecked
                />
                password
              </Label>
              <Label className='flex items-center gap-2 text-sm'>
                <input type='radio' value='key' {...register('authType')} />
                key
              </Label>
            </div>
          </div>

          {authType === 'password' ? (
            <div className='grid gap-1'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' {...register('password')} />
              {errors.password ? (
                <p className='text-sm text-red-600'>
                  {(errors.password as any)?.message}
                </p>
              ) : null}
            </div>
          ) : (
            <div className='grid gap-1'>
              <Label htmlFor='privateKeyPath'>Private Key Path</Label>
              <Input
                id='privateKeyPath'
                {...register('privateKeyPath')}
                placeholder='~/.ssh/id_rsa'
              />
              {errors.privateKeyPath ? (
                <p className='text-sm text-red-600'>
                  {(errors.privateKeyPath as any)?.message}
                </p>
              ) : null}
            </div>
          )}

          <div className='flex gap-2'>
            {connectionStatus === 'connected' ? (
              <Button
                variant='destructive'
                type='button'
                onClick={async () => {
                  try {
                    await disconnect();
                  } finally {
                    setConnectionStatus('disconnected');
                  }
                }}
              >
                Disconnect
              </Button>
            ) : (
              <>
                <Button
                  className={cn('h-9 rounded-md px-3')}
                  type='submit'
                  disabled={connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Connect'}
                </Button>
                <Button type='button' onClick={handleSubmit(onSave)}>
                  Save
                </Button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
