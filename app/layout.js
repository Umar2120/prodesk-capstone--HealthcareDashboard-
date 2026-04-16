import './globals.css';
import { AppProvider } from '../lib/AppContext';
import { AuthProvider } from '../lib/auth';

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
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
