import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/lib/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wilpf-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;