import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { RoutePath } from '@/lib/router';

type AppShellProps = {
  children: React.ReactNode;
  currentRoute: RoutePath;
};

function appShell({ children }: AppShellProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className='[--header-height:calc(--spacing(14))] w-full'>
          <div className='flex flex-col'>
            <SiteHeader />
            <div className='flex flex-1'>
              <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

export { appShell as AppShell };
