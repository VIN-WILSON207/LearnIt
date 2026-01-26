import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'LearntIt - Smart Learning, Better Results | O/L & A/L ICT & Computer Science',
  description: 'LearntIt: A comprehensive learning platform for O/L and A/L ICT & Computer Science. Learn with smart tools, better results, and expert guidance.',
  keywords: 'LearntIt, Learning Management System, O/L, A/L, ICT, Computer Science, Online Learning',
  openGraph: {
    title: 'LearntIt - Smart Learning Platform',
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
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
