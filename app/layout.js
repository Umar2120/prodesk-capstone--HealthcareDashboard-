import './globals.css';
import { AppProvider } from '../lib/AppContext';

export const metadata = {
  title: 'VitalSync | Healthcare Dashboard',
  description: 'Healthcare patient and doctor dashboard for appointments, records, and availability.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
