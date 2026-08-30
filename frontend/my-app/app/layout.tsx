import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { NotificationProvider } from '../lib/NotificationContext';
import { Plus_Jakarta_Sans, Cinzel } from 'next/font/google';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const classicFont = Cinzel({
  subsets: ['latin'],
  variable: '--font-classic',
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'Kamban College of Arts and Science for Women | Department Management & Talent Intelligence',
  description: 'Comprehensive college department management, student records, attendance, university marks, and AI-driven student talent discovery system for Kamban College of Arts and Science for Women, Tiruvannamalai.',
  keywords: 'Kamban College, KCAS, Department Management, Talent Intelligence, Tiruvannamalai, Higher Education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${sansFont.variable} ${classicFont.variable}`}>
      <head>
        <link rel="icon" href="/assets/images/kcas-logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FBF9F5] text-[#1A202C]">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

