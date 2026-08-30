import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { NotificationProvider } from '../lib/NotificationContext';

export const metadata = {
  title: 'Kamban College of Arts and Science for Women | Department Management & Talent Intelligence',
  description: 'Comprehensive college department management, student records, attendance, university marks, and AI-driven student talent discovery system for Kamban College of Arts and Science for Women, Tiruvannamalai.',
  keywords: 'Kamban College, KCAS, Department Management, Talent Intelligence, Tiruvannamalai, Higher Education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <head>
        <link rel="icon" href="/assets/images/kcas-logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
