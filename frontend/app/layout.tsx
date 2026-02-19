import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'LearnIt - Smart Learning, Better Results | O/L & A/L ICT & Computer Science',
  description: 'LearnIt: A comprehensive learning platform for O/L and A/L ICT & Computer Science.',
  keywords: 'LearnIt, Learning Management System, O/L, A/L, ICT, Computer Science, Online Learning',
  openGraph: {
    title: 'LearnIt - Smart Learning Platform',
    description: 'Smart Learning, Better Results',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}