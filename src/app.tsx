import { AppShell } from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useHashRoute } from '@/lib/router';

// Pages
import { DashboardPage } from '@/pages/dashboard.page';
import { DevicesPage } from '@/pages/devices.page';

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
    <SidebarProvider>
      <AppShell currentRoute={route}>{renderRoute()}</AppShell>
    </SidebarProvider>
  );
}

export default App;
