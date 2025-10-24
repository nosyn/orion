import * as React from 'react';
import {
  Command,
  LifeBuoy,
  Send,
  SquareTerminal,
  Settings2,
  HardDrive,
  FileCode2,
  Wifi,
  Boxes,
  Gauge,
  Wrench,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#/dashboard',
      icon: Gauge,
      isActive: true,
    },
    {
      title: 'Terminal',
      url: '#/terminal',
      icon: SquareTerminal,
    },
    {
      title: 'Files',
      url: '#/files',
      icon: HardDrive,
    },
    {
      title: 'Editor',
      url: '#/editor',
      icon: FileCode2,
    },
    {
      title: 'Wi‑Fi',
      url: '#/wifi',
      icon: Wifi,
    },
    {
      title: 'Docker',
      url: '#/docker',
      icon: Boxes,
    },
    {
      title: 'System',
      url: '#/system',
      icon: Wrench,
    },
    {
      title: 'Libraries',
      url: '#/libraries',
      icon: Settings2,
    },
    {
      title: 'Settings',
      url: '#/settings',
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [],
};

function appSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Acme Inc</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export { appSidebar as AppSidebar };
