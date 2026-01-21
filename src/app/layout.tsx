import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToasterProvider from '@/components/ToasterProvider'; 
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookingApp - Đặt phòng homestay, khách sạn',
  description: 'Nền tảng đặt phòng trực tuyến tốt nhất',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <AuthProvider>
          {/* Thay thế cục code dài ngoằng bằng 1 dòng này */}
          <ToasterProvider /> 
          <Header />
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}