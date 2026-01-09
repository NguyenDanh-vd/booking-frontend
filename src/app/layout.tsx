import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Booking App - Đặt phòng Homestay',
  description: 'Website đặt phòng uy tín, giá rẻ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster position="top-center" />
        <AuthProvider>
          <Header />
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>

        <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm">
          © 2026 Booking App. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
