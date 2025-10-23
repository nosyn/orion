import { useState } from 'react';
import { AppSidebar } from './components/app-sidebar';
import { invoke } from '@tauri-apps/api/core';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { SiteHeader } from './components/site-header';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }));
  }

  return (
    <div className='[--header-height:calc(--spacing(14))]'>
      <SidebarProvider className='flex flex-col'>
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar />
          <SidebarInset>
            <div className='flex flex-1 flex-col gap-4 p-4'>
              <form
                className='row'
                onSubmit={(e) => {
                  e.preventDefault();
                  greet();
                }}
              >
                <input
                  id='greet-input'
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder='Enter a name...'
                />
                <button type='submit'>Greet</button>
              </form>
              <p>{greetMsg}</p>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default App;
