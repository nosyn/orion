import { SidebarProvider } from '@/components/ui/sidebar';
import { AppShell } from '@/components/layout/app-shell';
import { useHashRoute } from '@/lib/router';

// Pages
import { DashboardPage } from '@/pages/dashboard.page';
import { TerminalPage } from '@/pages/terminal.page';
import { FilesPage } from '@/pages/files.page';
import { EditorPage } from '@/pages/editor.page';
import { WifiPage } from '@/pages/wifi.page';
import { DockerPage } from '@/pages/docker.page';
import { SystemPage } from '@/pages/system.page';
import { LibrariesPage } from '@/pages/libraries.page';
import { SettingsPage } from '@/pages/settings.page';

function App() {
  const { route } = useHashRoute();

  const renderRoute = () => {
    switch (route) {
      case '/dashboard':
        return <DashboardPage />;
      case '/terminal':
        return <TerminalPage />;
      case '/files':
        return <FilesPage />;
      case '/editor':
        return <EditorPage />;
      case '/wifi':
        return <WifiPage />;
      case '/docker':
        return <DockerPage />;
      case '/system':
        return <SystemPage />;
      case '/libraries':
        return <LibrariesPage />;
      case '/settings':
        return <SettingsPage />;
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
