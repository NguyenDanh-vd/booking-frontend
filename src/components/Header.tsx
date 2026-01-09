'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          BookingApp
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/properties/create"
            className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full"
          >
            Cho thuê chỗ ở
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="font-medium hover:underline">
                Tài khoản
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="font-medium text-gray-600 px-3 py-2">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
