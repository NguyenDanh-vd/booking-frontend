'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminStatsService } from '@/services/admin.service';
import dynamic from 'next/dynamic';
// Dynamic import Chart.js để tránh SSR lỗi
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// Kiểu dữ liệu thống kê
type AdminStats = {
  totalUsers: number;
  totalBookings: number;
  totalProperties: number;
  totalRevenue: number;
};
import Image from 'next/image';
import Link from 'next/link';
import {
  User, Mail, Phone, LogOut,
  Map, Heart, Home, PlusCircle,
  Settings, ShieldCheck, ChevronRight, Edit3,
  CreditCard
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, loading } = useAuth();
  const router = useRouter();

  // State cho dashboard admin
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Lấy dữ liệu dashboard nếu là admin
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await adminStatsService.getDashboardStats();
        if (!cancelled) setAdminStats(data);
      } catch {
        if (!cancelled) setAdminStats(null);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);


  // Redirect nếu chưa login
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* 1. HEADER BANNER */}
      <div className="relative h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">

        {/* 2. PROFILE CARD CHÍNH */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>

          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
              {user.avatar ? (
                <Image src={user.avatar} alt="Avatar" fill className="object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <User size={64} />
                </div>
              )}
            </div>
            {/* Nút sửa nhanh avatar */}
            <Link
              href="/profile/edit"
              className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full border-2 border-white shadow-md hover:bg-blue-700 transition"
              title="Đổi ảnh đại diện"
            >
              <Edit3 size={16} />
            </Link>
          </div>

          {/* User Info */}
          <div className="flex-grow text-center md:text-left space-y-2 pb-2">
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-gray-500 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-blue-500" /> {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={16} className="text-green-500" /> {user.phone}
                </div>
              )}
            </div>
            {/* Badge */}
            <div className="pt-2 flex justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                <ShieldCheck size={12} /> Đã xác thực
              </span>
              {user.role && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1">
                  Vai trò:
                  {user.role === 'ADMIN' && ' Quản trị viên'}
                  {user.role === 'HOST' && ' Chủ nhà'}
                  {user.role === 'GUEST' && ' Khách'}
                  {user.role !== 'ADMIN' && user.role !== 'HOST' && user.role !== 'GUEST' && ` ${user.role}`}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button Big */}
          <div className="hidden md:block">
            <Link
              href="/profile/edit"
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
            >
              <Settings size={18} /> Cài đặt hồ sơ
            </Link>
          </div>
        </div>


        {/* 3. DASHBOARD ADMIN */}
        {user.role === 'ADMIN' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Bảng điều khiển quản trị</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 text-center border">
                <div className="text-gray-500 text-sm mb-2">Tổng số người dùng</div>
                <div className="text-3xl font-bold text-blue-700">{loadingStats ? '...' : adminStats?.totalUsers ?? '...'}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center border">
                <div className="text-gray-500 text-sm mb-2">Tổng số booking</div>
                <div className="text-3xl font-bold text-green-700">{loadingStats ? '...' : adminStats?.totalBookings ?? '...'}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center border">
                <div className="text-gray-500 text-sm mb-2">Tổng số chỗ nghỉ</div>
                <div className="text-3xl font-bold text-orange-700">{loadingStats ? '...' : adminStats?.totalProperties ?? '...'}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 text-center border">
                <div className="text-gray-500 text-sm mb-2">Tổng doanh thu</div>
                <div className="text-3xl font-bold text-purple-700">{loadingStats ? '...' : adminStats?.totalRevenue?.toLocaleString('vi-VN') ?? '...'} đ</div>
              </div>
            </div>
            {/* Biểu đồ tổng quan */}
            <div className="bg-white rounded-xl shadow p-6 border">
              <h3 className="font-bold mb-4 text-lg">Thống kê trực quan</h3>
              {typeof window !== 'undefined' && Chart && adminStats && (
                <Chart
                  type="donut"
                  width={400}
                  options={{
                    labels: ['Người dùng', 'Booking', 'Chỗ nghỉ'],
                    colors: ['#2563eb', '#22c55e', '#f59e42'],
                    legend: { position: 'bottom' },
                  }}
                  series={[adminStats.totalUsers, adminStats.totalBookings, adminStats.totalProperties]}
                />
              )}
            </div>
          </div>
        )}
        <div className={`grid grid-cols-1 ${user.role === 'GUEST' ? 'md:grid-cols-2' : ''} gap-8`}>
          {/* CỘT TRÁI: Hoạt động của tôi (chỉ hiện với GUEST) */}
          {user.role === 'GUEST' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-2">
                <User className="text-blue-600" size={20} /> Hoạt động của tôi
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Link href="/my-bookings" className="group flex items-center justify-between p-5 hover:bg-blue-50 transition border-b border-gray-50 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <Map size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-700">Chuyến đi của tôi</p>
                      <p className="text-xs text-gray-500">Xem lịch sử đặt phòng</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/wishlist" className="group flex items-center justify-between p-5 hover:bg-red-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                      <Heart size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-red-700">Danh sách yêu thích</p>
                      <p className="text-xs text-gray-500">Các địa điểm đã lưu</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/my-payments" className="group flex items-center justify-between p-5 hover:bg-purple-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                      <Settings size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-purple-700">Lịch sử thanh toán</p>
                      <p className="text-xs text-gray-500">Xem các giao dịch đã thực hiện</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/notifications" className="group flex items-center justify-between p-5 hover:bg-yellow-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-yellow-700">Thông báo</p>
                      <p className="text-xs text-gray-500">Xem các thông báo cá nhân</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          )}

          {/* CỘT PHẢI: Dành cho chủ nhà (chỉ HOST hoặc ADMIN) */}
          {user.role === 'HOST' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-2">
                <Home className="text-orange-600" size={20} /> Dành cho chủ nhà
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Link href="/my-properties" className="group flex items-center justify-between p-5 hover:bg-orange-50 transition border-b border-gray-50 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                      <Home size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-orange-700">Quản lý nhà cho thuê</p>
                      <p className="text-xs text-gray-500">Danh sách tài sản của bạn</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/properties/create" className="group flex items-center justify-between p-5 hover:bg-green-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-green-700">Đăng chỗ nghỉ mới</p>
                      <p className="text-xs text-gray-500">Tiếp cận hàng triệu khách hàng</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/host/payments" className="group flex items-center justify-between p-5 hover:bg-purple-50 transition cursor-pointer border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-purple-700">Xác nhận thanh toán</p>
                      <p className="text-xs text-gray-500">Quản lý thanh toán từ khách hàng</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/notifications" className="group flex items-center justify-between p-5 hover:bg-yellow-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-yellow-700">Thông báo</p>
                      <p className="text-xs text-gray-500">Xem thông báo về booking & thanh toán</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          )}

          {/* CỘT PHẢI: Dành cho quản trị viên (ADMIN) */}
          {user.role === 'ADMIN' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-2">
                <Settings className="text-gray-800" size={20} /> Quản trị hệ thống
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Link href="/admin/dashboard" className="group flex items-center justify-between p-5 hover:bg-blue-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
                      <Settings size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-700">Bảng điều khiển quản trị</p>
                      <p className="text-xs text-gray-500">Xem tổng quan & truy cập nhanh các chức năng</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-700 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/admin/users" className="group flex items-center justify-between p-5 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center group-hover:bg-gray-700 group-hover:text-white transition">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-gray-700">Quản lý người dùng</p>
                      <p className="text-xs text-gray-500">Xem và quản lý tài khoản hệ thống</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/notifications" className="group flex items-center justify-between p-5 hover:bg-yellow-50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-yellow-700">Thông báo hệ thống</p>
                      <p className="text-xs text-gray-500">Xem thông báo quản trị & báo cáo</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition" />
                </Link>
                {/* Có thể bổ sung thêm các mục quản trị khác tại đây */}
              </div>
            </div>
          )}

          {/* FOOTER: LOGOUT */}
          <div className="md:col-span-2 mt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-bold text-gray-900">Đăng xuất tài khoản</h4>
                <p className="text-xs text-gray-500">Kết thúc phiên làm việc hiện tại trên thiết bị này.</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Đăng xuất ngay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}