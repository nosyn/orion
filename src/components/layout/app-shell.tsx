import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/app-sidebar';
import { RoutePath } from '@/lib/router';

type AppShellProps = {
  children: React.ReactNode;
  currentRoute: RoutePath;
};

function appShell({ children }: AppShellProps) {
  return (
    <div className='[--header-height:calc(--spacing(14))] w-full'>
      <div className='flex flex-col'>
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar />
          <SidebarInset>
            <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
          </SidebarInset>
        </div>
      </div>
    </div>
  );
}

export { appShell as AppShell };
