import * as React from 'react';
import { SshConfig, AuthType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { connect } from '@/lib/ipc';

export function SettingsPage() {
  const [form, setForm] = React.useState<SshConfig>({
    host: '',
    port: 22,
    username: '',
    authType: 'password',
    password: '',
    privateKeyPath: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>('');

  const onChange = (k: keyof SshConfig, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const validate = (): string | null => {
    if (!form.host.trim()) return 'Host is required';
    if (!form.username.trim()) return 'Username is required';
    if (!Number.isInteger(form.port) || form.port <= 0)
      return 'Port must be a positive integer';
    if (form.authType === 'password' && !form.password?.trim())
      return 'Password is required';
    if (form.authType === 'key' && !form.privateKeyPath?.trim())
      return 'Private key path is required';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setError(v);
    setStatus('');
    if (v) return;
    try {
      await connect(form);
      setStatus('Connected ✔');
    } catch (err: any) {
      setStatus('');
      setError(err?.message || String(err));
    }
  };

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Settings</h1>
      <section className='space-y-2'>
        <h2 className='text-base font-medium'>Connection Wizard</h2>
        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-3 max-w-xl'>
          <div className='grid gap-1'>
            <label className='text-sm' htmlFor='host'>
              Host
            </label>
            <input
              id='host'
              className='h-9 rounded-md border px-2 bg-background'
              value={form.host}
              onChange={(e) => onChange('host', e.target.value)}
              placeholder='192.168.1.100'
            />
          </div>
          <div className='grid gap-1'>
            <label className='text-sm' htmlFor='port'>
              Port
            </label>
            <input
              id='port'
              type='number'
              className='h-9 rounded-md border px-2 bg-background'
              value={form.port}
              onChange={(e) =>
                onChange('port', parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className='grid gap-1'>
            <label className='text-sm' htmlFor='username'>
              Username
            </label>
            <input
              id='username'
              className='h-9 rounded-md border px-2 bg-background'
              value={form.username}
              onChange={(e) => onChange('username', e.target.value)}
              placeholder='ubuntu'
            />
          </div>
          <div className='grid gap-1'>
            <label className='text-sm'>Auth Type</label>
            <div className='flex gap-4'>
              {(['password', 'key'] as AuthType[]).map((t) => (
                <label key={t} className='flex items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    name='authType'
                    checked={form.authType === t}
                    onChange={() => onChange('authType', t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          {form.authType === 'password' ? (
            <div className='grid gap-1'>
              <label className='text-sm' htmlFor='password'>
                Password
              </label>
              <input
                id='password'
                type='password'
                className='h-9 rounded-md border px-2 bg-background'
                value={form.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
              />
            </div>
          ) : (
            <div className='grid gap-1'>
              <label className='text-sm' htmlFor='key'>
                Private Key Path
              </label>
              <input
                id='key'
                className='h-9 rounded-md border px-2 bg-background'
                value={form.privateKeyPath || ''}
                onChange={(e) => onChange('privateKeyPath', e.target.value)}
                placeholder='~/.ssh/id_rsa'
              />
            </div>
          )}
          {error ? <div className='text-sm text-red-600'>{error}</div> : null}
          {status ? (
            <div className='text-sm text-green-600'>{status}</div>
          ) : null}
          <div className='flex gap-2'>
            <button
              className={cn(
                'h-9 rounded-md px-3 border bg-primary text-primary-foreground'
              )}
            >
              Connect
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
