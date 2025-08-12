import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Learning Management System',
  description: 'LMS for course management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}