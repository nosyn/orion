import * as React from 'react';
import {
  add_device,
  list_devices,
  listCredentials,
  save_credential,
  connect,
  disconnect_token,
} from '@/lib/ipc';
import { useAppStore } from '@/stores/app.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DevicesPage() {
  const sessions = useAppStore((s) => s.sessions);
  const [devices, setDevices] = React.useState<
    Array<{ id: number; name: string; description?: string }>
  >([]);
  const [creds, setCreds] = React.useState<any[]>([]);
  const [addName, setAddName] = React.useState('');
  const [addDescription, setAddDescription] = React.useState('');
  const [showCredForm, setShowCredForm] = React.useState<
    Record<number, boolean>
  >({});

  React.useEffect(() => {
    (async () => {
      const ds = await list_devices();
      setDevices(ds);
      const c = await listCredentials();
      setCreds(c);
    })();
  }, []);

  async function onAddDevice(e: React.FormEvent) {
    e.preventDefault();
    if (!addName) return;
    await add_device(addName, addDescription);
    const ds = await list_devices();
    setDevices(ds);
    setAddName('');
    setAddDescription('');
  }

  async function onSaveCredential(
    e: React.FormEvent<HTMLFormElement>,
    deviceId: number
  ) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const cfg: SshConfig = {
      host: String(form.get('host') || ''),
      port: Number(form.get('port') || 22),
      username: String(form.get('username') || ''),
      auth_type: String(form.get('auth_type') || 'password') as AuthType,
      password: String(form.get('password') || '') || undefined,
      private_key_path: String(form.get('private_key_path') || '') || undefined,
    };
    await save_credential(cfg, deviceId);
    const c = await listCredentials();
    setCreds(c);
    setShowCredForm((prev) => ({ ...prev, [deviceId]: false }));
  }

  async function onConnectWithDevice(id: number) {
    // Choose first credential for now; future: show a picker
    const c = creds.find((x) => x.device_id === id) || creds[0];
    if (!c) return;
    const cfg: SshConfig = {
      host: c.host,
      port: Number(c.port || 22),
      username: c.username,
      auth_type: c.auth_type,
      password: c.password || undefined,
      private_key_path: c.private_key_path || undefined,
    };
    await connect(cfg, id);
  }

  function deviceStatus(id: number): { connected: boolean; token?: string } {
    const entry = Object.values(sessions).find((s) => s.device_id === id);
    return entry
      ? { connected: true, token: entry.token }
      : { connected: false };
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Devices</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {/* Add Device card */}
        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle>Add Device</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddDevice} className='grid grid-cols-1 gap-2'>
              <input
                className='border rounded px-2 py-1 w-full'
                placeholder='Name'
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
              />
              <input
                className='border rounded px-2 py-1 w-full'
                placeholder='Description (optional)'
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
              />
              <button className='border rounded px-3 py-1 justify-self-start'>
                Add
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Device cards */}
        {devices.map((d) => {
          const cred = creds.find((c) => c.device_id === d.id);
          const status = deviceStatus(d.id);
          return (
            <Card key={d.id}>
              <CardHeader>
                <div className='flex items-center justify-between gap-2'>
                  <CardTitle className='text-base'>{d.name}</CardTitle>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      status.connected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-sm text-muted-foreground'>
                  {d.description || '—'}
                </div>
                <div className='text-sm'>
                  Host:{' '}
                  {cred ? (
                    <span className='font-mono'>
                      {cred.username}@{cred.host}:{cred.port}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>No credential</span>
                  )}
                </div>
                <div className='flex flex-wrap gap-2 pt-2'>
                  {status.connected ? (
                    <button
                      className='border rounded px-3 py-1'
                      onClick={async () => {
                        if (status.token) await disconnect_token(status.token);
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      className='border rounded px-3 py-1'
                      onClick={() => onConnectWithDevice(d.id)}
                      disabled={!cred}
                      title={!cred ? 'Add a credential first' : ''}
                    >
                      Connect
                    </button>
                  )}
                  <button
                    className='border rounded px-3 py-1'
                    onClick={() =>
                      setShowCredForm((prev) => ({
                        ...prev,
                        [d.id]: !prev[d.id],
                      }))
                    }
                  >
                    {showCredForm[d.id]
                      ? 'Hide Credential'
                      : cred
                      ? 'Update Credential'
                      : 'Add Credential'}
                  </button>
                </div>
                {showCredForm[d.id] && (
                  <form
                    onSubmit={(e) => onSaveCredential(e, d.id)}
                    className='mt-3 grid grid-cols-2 gap-2'
                  >
                    <input
                      className='border rounded px-2 py-1'
                      name='host'
                      placeholder='Host'
                      required
                    />
                    <input
                      className='border rounded px-2 py-1'
                      name='port'
                      placeholder='Port'
                      defaultValue={22}
                    />
                    <input
                      className='border rounded px-2 py-1'
                      name='username'
                      placeholder='Username'
                      required
                    />
                    <select
                      className='border rounded px-2 py-1'
                      name='auth_type'
                      defaultValue='password'
                    >
                      <option value='password'>password</option>
                      <option value='key'>key</option>
                    </select>
                    <input
                      className='border rounded px-2 py-1'
                      name='password'
                      placeholder='Password (optional)'
                    />
                    <input
                      className='border rounded px-2 py-1'
                      name='private_key_path'
                      placeholder='Private Key Path (optional)'
                    />
                    <div className='col-span-2'>
                      <button className='border rounded px-3 py-1'>Save</button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
