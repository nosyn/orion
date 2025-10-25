import { Toaster } from '@/components/ui/sonner';

import { AppShell } from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useHashRoute } from '@/lib/router';

// Pages
import { DashboardPage } from '@/pages/dashboard.page';
import { DevicesPage } from '@/pages/devices/page';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';

function App() {
  const { route } = useHashRoute();

  const renderRoute = () => {
    switch (route) {
      case '/dashboard':
        return <DashboardPage />;
      case '/devices':
        return <DevicesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position='top-center' />
      <SidebarProvider>
        <AppShell currentRoute={route}>{renderRoute()}</AppShell>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
