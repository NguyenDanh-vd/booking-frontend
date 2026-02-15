'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import { adminDataService } from '@/services/admin-data.service';
import type { IBooking, IPayment, IProperty, IUser } from '@/types/backend';
import dynamic from 'next/dynamic';
// Dynamic import Chart.js để tránh lỗi SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// Kiểu dữ liệu thống kê
type AdminStats = {
  totalUsers: number;
  totalBookings: number;
  totalProperties: number;
  totalRevenue: number;
};
type GuestStats = {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  paidAmount: number;
  refundedAmount: number;
  pendingAmount: number;
};
type HostStats = {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  maintenanceProperties: number;
  pendingPayments: number;
  pendingAmount: number;
};
import Image from 'next/image';
import Link from 'next/link';
import {
  User, Mail, Phone, LogOut,
  Map, Heart, Home, PlusCircle,
  Settings, ShieldCheck, ChevronRight, Edit3,
  CreditCard, Users, CalendarCheck2, Building2, CircleDollarSign
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, loading } = useAuth();
  const router = useRouter();

  // State cho dashboard admin
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [loadingGuestStats, setLoadingGuestStats] = useState(false);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [loadingHostStats, setLoadingHostStats] = useState(false);

  // Lấy dữ liệu dashboard nếu là admin
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const [usersResult, bookingsResult, propertiesResult, paymentsResult] =
          await Promise.allSettled([
            apiGet<IUser[]>('/users/admin/users'),
            adminDataService.getBookings(),
            adminDataService.getProperties(),
            adminDataService.getPayments(),
          ]);

        const totalUsers =
          usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)
            ? usersResult.value.length
            : 0;

        const totalBookings =
          bookingsResult.status === 'fulfilled' && Array.isArray(bookingsResult.value)
            ? bookingsResult.value.length
            : 0;

        const totalProperties =
          propertiesResult.status === 'fulfilled' && Array.isArray(propertiesResult.value)
            ? propertiesResult.value.length
            : 0;

        const totalRevenue =
          paymentsResult.status === 'fulfilled' && Array.isArray(paymentsResult.value)
            ? paymentsResult.value.reduce(
                (sum, payment) => sum + (Number(payment.amount) || 0),
                0
              )
            : 0;

        if (!cancelled) {
          setAdminStats({
            totalUsers,
            totalBookings,
            totalProperties,
            totalRevenue,
          });
        }
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

  // Lấy dữ liệu dashboard nếu là host
  useEffect(() => {
    if (user?.role !== 'HOST') return;

    let cancelled = false;

    const fetchHostStats = async () => {
      try {
        setLoadingHostStats(true);
        const [propertiesResult, pendingPaymentsResult] = await Promise.allSettled([
          apiGet<IProperty[]>('/properties/host'),
          apiGet<IPayment[]>('/payments/host/pending'),
        ]);

        const properties =
          propertiesResult.status === 'fulfilled' && Array.isArray(propertiesResult.value)
            ? propertiesResult.value
            : [];
        const pendingPayments =
          pendingPaymentsResult.status === 'fulfilled' &&
          Array.isArray(pendingPaymentsResult.value)
            ? pendingPaymentsResult.value
            : [];

        const totalProperties = properties.length;
        const activeProperties = properties.filter((item) => item.status === 'ACTIVE').length;
        const inactiveProperties = properties.filter((item) => item.status === 'INACTIVE').length;
        const maintenanceProperties = properties.filter(
          (item) => item.status === 'MAINTENANCE'
        ).length;
        const pendingAmount = pendingPayments.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );

        if (!cancelled) {
          setHostStats({
            totalProperties,
            activeProperties,
            inactiveProperties,
            maintenanceProperties,
            pendingPayments: pendingPayments.length,
            pendingAmount,
          });
        }
      } catch {
        if (!cancelled) setHostStats(null);
      } finally {
        if (!cancelled) setLoadingHostStats(false);
      }
    };

    void fetchHostStats();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  // Lấy dữ liệu dashboard nếu là guest
  useEffect(() => {
    if (user?.role !== 'GUEST') return;

    let cancelled = false;

    const fetchGuestStats = async () => {
      try {
        setLoadingGuestStats(true);
        const [bookingsResult, paymentsResult] = await Promise.allSettled([
          apiGet<IBooking[]>('/bookings'),
          apiGet<IPayment[]>('/payments'),
        ]);

        const bookings =
          bookingsResult.status === 'fulfilled' && Array.isArray(bookingsResult.value)
            ? bookingsResult.value
            : [];
        const payments =
          paymentsResult.status === 'fulfilled' && Array.isArray(paymentsResult.value)
            ? paymentsResult.value
            : [];

        const totalBookings = bookings.length;
        const upcomingBookings = bookings.filter((item) =>
          ['PENDING', 'CONFIRMED'].includes(item.status)
        ).length;
        const completedBookings = bookings.filter((item) => item.status === 'COMPLETED').length;

        const paidAmount = payments
          .filter((item) => item.status === 'SUCCESS')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const refundedAmount = payments
          .filter((item) => item.status === 'REFUNDED')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const pendingAmount = payments
          .filter((item) => item.status === 'PENDING')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        if (!cancelled) {
          setGuestStats({
            totalBookings,
            upcomingBookings,
            completedBookings,
            paidAmount,
            refundedAmount,
            pendingAmount,
          });
        }
      } catch {
        if (!cancelled) setGuestStats(null);
      } finally {
        if (!cancelled) setLoadingGuestStats(false);
      }
    };

    void fetchGuestStats();

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

  const usersValue = adminStats?.totalUsers ?? 0;
  const bookingsValue = adminStats?.totalBookings ?? 0;
  const propertiesValue = adminStats?.totalProperties ?? 0;
  const revenueValue = adminStats?.totalRevenue ?? 0;

  const chartSeries = [usersValue, bookingsValue, propertiesValue];
  const chartTotal = chartSeries.reduce((sum, value) => sum + value, 0);
  const chartItems = [
    {
      label: 'Người dùng',
      value: usersValue,
      colorClass: 'bg-blue-500',
      textClass: 'text-blue-700',
      trackClass: 'bg-blue-100',
    },
    {
      label: 'Booking',
      value: bookingsValue,
      colorClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
      trackClass: 'bg-emerald-100',
    },
    {
      label: 'Chỗ nghỉ',
      value: propertiesValue,
      colorClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      trackClass: 'bg-amber-100',
    },
  ];
  const guestPaidAmount = guestStats?.paidAmount ?? 0;
  const guestRefundedAmount = guestStats?.refundedAmount ?? 0;
  const guestPendingAmount = guestStats?.pendingAmount ?? 0;
  const guestNetSpent = Math.max(0, guestPaidAmount - guestRefundedAmount);
  const guestChartSeries = [guestPaidAmount, guestRefundedAmount, guestPendingAmount];
  const guestChartTotal = guestChartSeries.reduce((sum, value) => sum + value, 0);
  const hostActive = hostStats?.activeProperties ?? 0;
  const hostInactive = hostStats?.inactiveProperties ?? 0;
  const hostMaintenance = hostStats?.maintenanceProperties ?? 0;
  const hostTotalProperties = hostStats?.totalProperties ?? 0;
  const hostPendingPayments = hostStats?.pendingPayments ?? 0;
  const hostPendingAmount = hostStats?.pendingAmount ?? 0;
  const hostActiveRate = hostTotalProperties > 0 ? Math.round((hostActive / hostTotalProperties) * 100) : 0;
  const hostChartSeries = [hostActive, hostInactive, hostMaintenance];
  const hostChartTotal = hostChartSeries.reduce((sum, value) => sum + value, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* 1. HEADER BANNER */}
      <div className="relative h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">

        {/* 2. PROFILE CARD CHÍNH */}
        <div className="relative mb-8 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_48px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -left-24 -top-20 h-56 w-56 rounded-full bg-cyan-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-52 w-52 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-end">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>

          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ring-4 ring-blue-50">
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
              className="absolute bottom-2 right-2 rounded-full border-2 border-white bg-blue-600 p-2 text-white shadow-md transition hover:scale-105 hover:bg-blue-700"
              title="Đổi ảnh đại diện"
            >
              <Edit3 size={16} />
            </Link>
          </div>

          {/* User Info */}
          <div className="flex-grow space-y-2 pb-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">{user.fullName}</h1>
            <div className="flex flex-col items-center gap-2 text-sm font-medium text-gray-500 md:flex-row md:gap-6">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1.5">
                <Mail size={16} className="text-blue-500" /> {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1.5">
                  <Phone size={16} className="text-green-500" /> {user.phone}
                </div>
              )}
            </div>
            {/* Badge */}
            <div className="flex justify-center gap-2 pt-2 md:justify-start">
              {user.role !== 'ADMIN' && (
                <span
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                    user.isVerified
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}
                >
                  <ShieldCheck size={12} />
                  {user.isVerified ? ' Đã xác thực' : ' Chưa xác thực'}
                </span>
              )}
              {user.role && (
                <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
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
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Settings size={18} /> Cài đặt hồ sơ
            </Link>
          </div>
        </div>
        </div>


        {/* 3. DASHBOARD ADMIN */}
        {user.role === 'ADMIN' && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Bảng điều khiển quản trị</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Tổng quan quản trị
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 text-sm font-medium">Tổng số người dùng</div>
                  <span className="rounded-lg bg-blue-600 p-2 text-white">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold text-blue-800">{loadingStats ? '...' : adminStats?.totalUsers ?? '...'}</div>
              </div>
              <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 text-sm font-medium">Tổng số booking</div>
                  <span className="rounded-lg bg-emerald-600 p-2 text-white">
                    <CalendarCheck2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold text-emerald-800">{loadingStats ? '...' : adminStats?.totalBookings ?? '...'}</div>
              </div>
              <div className="group rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 text-sm font-medium">Tổng số chỗ nghỉ</div>
                  <span className="rounded-lg bg-amber-500 p-2 text-white">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold text-amber-800">{loadingStats ? '...' : adminStats?.totalProperties ?? '...'}</div>
              </div>
              <div className="group rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 text-sm font-medium">Tổng doanh thu</div>
                  <span className="rounded-lg bg-violet-600 p-2 text-white">
                    <CircleDollarSign className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold text-violet-800">{loadingStats ? '...' : adminStats?.totalRevenue?.toLocaleString('vi-VN') ?? '...'} đ</div>
              </div>
            </div>
            {/* Biểu đồ tổng quan */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 shadow-lg p-6 md:p-7">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="font-bold mb-0 text-lg text-slate-900">Thống kê trực quan</h3>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Cập nhật thời gian thực
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5">
                  {typeof window !== 'undefined' && Chart && (
                    <Chart
                      type="donut"
                      height={320}
                      options={{
                        labels: ['Người dùng', 'Booking', 'Chỗ nghỉ'],
                        colors: ['#2563eb', '#10b981', '#f59e0b'],
                        chart: {
                          toolbar: { show: false },
                          dropShadow: {
                            enabled: true,
                            top: 2,
                            left: 0,
                            blur: 6,
                            color: '#0f172a',
                            opacity: 0.1,
                          },
                        },
                        dataLabels: { enabled: false },
                        stroke: { width: 3, colors: ['#ffffff'] },
                        legend: {
                          position: 'bottom',
                          fontSize: '13px',
                          markers: { size: 10, shape: 'circle' },
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '68%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Tổng',
                                  formatter: () => `${chartTotal}`,
                                },
                              },
                            },
                          },
                        },
                        tooltip: {
                          y: {
                            formatter: (value: number) => `${value.toLocaleString('vi-VN')}`,
                          },
                        },
                      }}
                      series={chartSeries}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Doanh thu</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {loadingStats ? '...' : revenueValue.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Tổng thực thể</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {loadingStats ? '...' : chartTotal.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                    {chartItems.map((item) => {
                      const percent = chartTotal > 0 ? Math.round((item.value / chartTotal) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${item.colorClass}`}></span>
                              <span className="font-medium text-slate-700">{item.label}</span>
                            </div>
                            <span className={`font-semibold ${item.textClass}`}>
                              {loadingStats ? '...' : `${item.value.toLocaleString('vi-VN')} (${percent}%)`}
                            </span>
                          </div>
                          <div className={`h-2.5 w-full overflow-hidden rounded-full ${item.trackClass}`}>
                            <div
                              className={`h-full rounded-full ${item.colorClass} transition-all duration-700`}
                              style={{ width: `${loadingStats ? 0 : percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. DASHBOARD GUEST */}
        {user.role === 'GUEST' && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Bảng điều khiển dành cho Khách</h2>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Theo dõi chi tiêu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Tổng booking</div>
                <div className="mt-3 text-3xl font-bold text-blue-800">
                  {loadingGuestStats ? '...' : guestStats?.totalBookings ?? 0}
                </div>
              </div>
              <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Chuyến đi sắp tới</div>
                <div className="mt-3 text-3xl font-bold text-emerald-800">
                  {loadingGuestStats ? '...' : guestStats?.upcomingBookings ?? 0}
                </div>
              </div>
              <div className="group rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Đã hoàn thành</div>
                <div className="mt-3 text-3xl font-bold text-violet-800">
                  {loadingGuestStats ? '...' : guestStats?.completedBookings ?? 0}
                </div>
              </div>
              <div className="group rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Tổng đã chi (ròng)</div>
                <div className="mt-3 text-3xl font-bold text-amber-800">
                  {loadingGuestStats ? '...' : `${guestNetSpent.toLocaleString('vi-VN')} đ`}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-50/40 shadow-lg p-6 md:p-7">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="font-bold mb-0 text-lg text-slate-900">Biểu đồ chi tiêu của tôi</h3>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Theo trạng thái thanh toán
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5">
                  {guestChartTotal > 0 ? (
                    <Chart
                      type="donut"
                      height={320}
                      options={{
                        labels: ['Đã thanh toán', 'Đã hoàn tiền', 'Đang xử lý'],
                        colors: ['#2563eb', '#f59e0b', '#10b981'],
                        chart: { toolbar: { show: false } },
                        dataLabels: { enabled: false },
                        stroke: { width: 3, colors: ['#ffffff'] },
                        legend: { position: 'bottom', markers: { size: 10, shape: 'circle' } },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '68%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Tổng giao dịch',
                                  formatter: () => `${guestChartTotal.toLocaleString('vi-VN')} đ`,
                                },
                              },
                            },
                          },
                        },
                        tooltip: {
                          y: { formatter: (value: number) => `${value.toLocaleString('vi-VN')} đ` },
                        },
                      }}
                      series={guestChartSeries}
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center text-sm font-medium text-slate-500">
                      Chưa có dữ liệu thanh toán để hiển thị biểu đồ
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tổng đã thanh toán</p>
                    <p className="mt-2 text-xl font-bold text-blue-700">
                      {loadingGuestStats ? '...' : `${guestPaidAmount.toLocaleString('vi-VN')} đ`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tổng đã hoàn tiền</p>
                    <p className="mt-2 text-xl font-bold text-amber-700">
                      {loadingGuestStats ? '...' : `${guestRefundedAmount.toLocaleString('vi-VN')} đ`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Đang xử lý</p>
                    <p className="mt-2 text-xl font-bold text-emerald-700">
                      {loadingGuestStats ? '...' : `${guestPendingAmount.toLocaleString('vi-VN')} đ`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. DASHBOARD HOST */}
        {user.role === 'HOST' && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Bảng điều khiển dành cho Chủ nhà</h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Theo dõi tài sản
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Tổng tài sản</div>
                <div className="mt-3 text-3xl font-bold text-blue-800">
                  {loadingHostStats ? '...' : hostTotalProperties}
                </div>
              </div>
              <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Đang hoạt động</div>
                <div className="mt-3 text-3xl font-bold text-emerald-800">
                  {loadingHostStats ? '...' : hostActive}
                </div>
              </div>
              <div className="group rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Chờ xác nhận thanh toán</div>
                <div className="mt-3 text-3xl font-bold text-violet-800">
                  {loadingHostStats ? '...' : hostPendingPayments}
                </div>
              </div>
              <div className="group rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-600 text-sm font-medium">Tổng chờ thanh toán</div>
                <div className="mt-3 text-3xl font-bold text-amber-800">
                  {loadingHostStats ? '...' : `${hostPendingAmount.toLocaleString('vi-VN')} đ`}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 shadow-lg p-6 md:p-7">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="font-bold mb-0 text-lg text-slate-900">Biểu đồ vận hành tài sản</h3>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Phân bổ trạng thái phòng
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5">
                  {hostChartTotal > 0 ? (
                    <Chart
                      type="donut"
                      height={320}
                      options={{
                        labels: ['Đang hoạt động', 'Ngưng hoạt động', 'Bảo trì'],
                        colors: ['#10b981', '#64748b', '#f59e0b'],
                        chart: { toolbar: { show: false } },
                        dataLabels: { enabled: false },
                        stroke: { width: 3, colors: ['#ffffff'] },
                        legend: { position: 'bottom', markers: { size: 10, shape: 'circle' } },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '68%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Tổng tài sản',
                                  formatter: () => `${hostChartTotal}`,
                                },
                              },
                            },
                          },
                        },
                        tooltip: {
                          y: { formatter: (value: number) => `${value.toLocaleString('vi-VN')}` },
                        },
                      }}
                      series={hostChartSeries}
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center text-sm font-medium text-slate-500">
                      Chưa có dữ liệu tài sản để hiển thị biểu đồ
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tỷ lệ hoạt động</p>
                    <p className="mt-2 text-xl font-bold text-emerald-700">
                      {loadingHostStats ? '...' : `${hostActiveRate}%`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Ngưng hoạt động</p>
                    <p className="mt-2 text-xl font-bold text-slate-700">
                      {loadingHostStats ? '...' : hostInactive}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Bảo trì</p>
                    <p className="mt-2 text-xl font-bold text-amber-700">
                      {loadingHostStats ? '...' : hostMaintenance}
                    </p>
                  </div>
                </div>
              </div>
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
                      <p className="text-xs text-gray-500">Xem tổng quan và truy cập nhanh các chức năng</p>
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
                      <p className="text-xs text-gray-500">Xem thông báo quản trị và báo cáo</p>
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

