import type { SysInfo } from '@/lib/types';

export function SystemPage() {
  // Placeholder: system info will come from backend later
  const mock: Partial<SysInfo> = {
    hostname: '—',
    os: '—',
    kernel: '—',
    uptimeSec: 0,
  };
  return (
    <div className='space-y-2'>
      <h1 className='text-xl font-semibold'>System</h1>
      <div className='text-sm text-muted-foreground'>
        <div>Hostname: {mock.hostname}</div>
        <div>OS: {mock.os}</div>
        <div>Kernel: {mock.kernel}</div>
      </div>
    </div>
  );
}
