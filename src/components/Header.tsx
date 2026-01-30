'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, CalendarDays, PlusCircle, Menu, Settings } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  // Lấy user ra và SẼ SỬ DỤNG bên dưới
  const { isLoggedIn, logout, loading, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b app-border bg-white/80 backdrop-blur-md transition-all dark:bg-gray-900/80">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg transform group-hover:rotate-12 transition-transform duration-300">
            B
          </div>
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight group-hover:text-blue-700 transition-colors">
            BookingApp
          </span>
        </Link>

        {/* --- KHU VỰC ACTIONS --- */}
        <div className="flex items-center gap-6">

          {/* Nút: Cho thuê chỗ ở - Chỉ hiện với HOST */}
          {user?.role === 'HOST' && (
            <Link
              href="/properties/create"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-300"
            >
              <PlusCircle size={18} />
              <span>Cho thuê chỗ ở</span>
            </Link>
          )}

          {/* Nút: Quản trị - Chỉ hiện với ADMIN */}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-all duration-300"
            >
              <Settings size={18} />
              <span>Quản trị</span>
            </Link>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-full"></div>
              <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full"></div>
            </div>
          ) : (
            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-3">

                  {/* NÚT: CHUYẾN ĐI CỦA TÔI - Chỉ hiện với GUEST */}
                  {user?.role === 'GUEST' && (
                    <Link
                      href="/my-bookings"
                      className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-300"
                    >
                      <CalendarDays size={18} />
                      <span>Chuyến đi</span>
                    </Link>
                  )}

                  <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

                  {/* USER MENU */}
                  <div className="flex items-center gap-2 p-1 pl-2 pr-1 border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow bg-white">

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-gray-50 transition"
                      // SỬ DỤNG BIẾN user Ở ĐÂY (Trong title)
                      title={user?.fullName || "Trang cá nhân"}
                    >
                      <Menu size={16} className="text-gray-400 hidden sm:block" />

                      <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-sm font-bold text-xs">
                        {/* Hiển thị ký tự đầu của tên hoặc icon User */}
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={16} />}
                      </div>

                      {/* SỬ DỤNG BIẾN user Ở ĐÂY (Hiển thị tên) */}
                      <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate hidden lg:block">
                        {user?.fullName || 'Tài khoản'}
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>

                </div>
              ) : (
                // GIAO DIỆN CHƯA ĐĂNG NHẬP
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-full transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}