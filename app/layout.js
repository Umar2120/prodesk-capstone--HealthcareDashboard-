import './globals.css';
import { AppProvider } from '../lib/AppContext';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'VitalSync | Healthcare Dashboard',
  description: 'Healthcare patient and doctor dashboard for appointments, records, and availability.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
