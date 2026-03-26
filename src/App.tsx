import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import QueryProviders from '@/components/providers/QueryProviders';
import { AppProvider } from '@/app/AppContext';
import { AppRouter } from '@/app/router';

// Re-export types for backward compatibility
export type { Page, User, Note, Patient, Visit } from '@/app/types';

function App() {
  return (
    <BrowserRouter>
      <QueryProviders>
        <AppProvider>
          <AppRouter />
          <Toaster />
        </AppProvider>
      </QueryProviders>
    </BrowserRouter>
  );
}

export default App;
