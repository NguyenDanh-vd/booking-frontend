"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Building2,
  CalendarCheck2,
  ChevronRight,
  CircleDollarSign,
  ShieldCheck,
  Users,
} from "lucide-react";
import { apiGet } from "@/utils/api";
import { adminDataService } from "@/services/admin-data.service";
import type { IUser } from "@/types/backend";

type DashboardStats = {
  users: number;
  bookings: number;
  properties: number;
  revenue: number;
};

const initialStats: DashboardStats = {
  users: 0,
  bookings: 0,
  properties: 0,
  revenue: 0,
};

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<IUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const data = await apiGet<IUser>("/users/profile");
      setProfile(data ?? null);
    } catch (error) {
      console.error("Error fetching profile", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const [usersResult, bookingsResult, propertiesResult, paymentsResult] =
        await Promise.allSettled([
          apiGet<IUser[]>("/users/admin/users"),
          adminDataService.getBookings(),
          adminDataService.getProperties(),
          adminDataService.getPayments(),
        ]);

      const users =
        usersResult.status === "fulfilled" && Array.isArray(usersResult.value)
          ? usersResult.value.length
          : 0;

      const bookings =
        bookingsResult.status === "fulfilled" &&
        Array.isArray(bookingsResult.value)
          ? bookingsResult.value.length
          : 0;

      const properties =
        propertiesResult.status === "fulfilled" &&
        Array.isArray(propertiesResult.value)
          ? propertiesResult.value.length
          : 0;

      const revenue =
        paymentsResult.status === "fulfilled" &&
        Array.isArray(paymentsResult.value)
          ? paymentsResult.value.reduce(
              (sum, payment) => sum + (Number(payment.amount) || 0),
              0
            )
          : 0;

      setStats({ users, bookings, properties, revenue });
    } catch (error) {
      console.error("Error fetching admin stats", error);
      setStats(initialStats);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
    void fetchStats();
  }, []);

  const revenueText = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(stats.revenue),
    [stats.revenue]
  );

  return (
    <div className="relative max-w-6xl mx-auto py-8 space-y-6">
      <div className="pointer-events-none absolute -top-8 -right-6 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-10 h-60 w-60 rounded-full bg-indigo-300/20 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Bảng điều khiển quản trị
            </h1>
            <p className="mt-2 text-base text-slate-200">
              {profileLoading
                ? "Đang tải thông tin quản trị viên..."
                : profile
                ? `${profile.fullName} - ${profile.email}${profile.phone ? ` - ${profile.phone}` : ""}`
                : "Không thể tải thông tin quản trị viên"}
            </p>
            {!profileLoading && profile ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-100">
                <ShieldCheck className="h-4 w-4" /> Vai trò: {profile.role}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-cyan-100/90">Trạng thái hệ thống</p>
            <p className="mt-2 text-2xl font-semibold text-white">Ổn định</p>
            <p className="mt-1 text-sm text-slate-200">Các module chính đang hoạt động bình thường.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng số người dùng"
            value={statsLoading ? "..." : String(stats.users)}
            icon={<Users className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            title="Tổng số booking"
            value={statsLoading ? "..." : String(stats.bookings)}
            icon={<CalendarCheck2 className="h-5 w-5" />}
            tone="green"
          />
          <StatCard
            title="Tổng số chỗ nghỉ"
            value={statsLoading ? "..." : String(stats.properties)}
            icon={<Building2 className="h-5 w-5" />}
            tone="amber"
          />
          <StatCard
            title="Tổng doanh thu"
            value={statsLoading ? "..." : revenueText}
            icon={<CircleDollarSign className="h-5 w-5" />}
            tone="violet"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Quản trị nhanh</h2>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Truy cập nhanh</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <QuickLink
            href="/admin/users"
            label="Quản lý người dùng"
            hint="Tài khoản, vai trò, quyền hạn"
            icon={<Users className="h-5 w-5" />}
          />
          <QuickLink
            href="/admin/bookings"
            label="Quản lý booking"
            hint="Đơn đặt và trạng thái"
            icon={<CalendarCheck2 className="h-5 w-5" />}
          />
          <QuickLink
            href="/admin/properties"
            label="Quản lý chỗ nghỉ"
            hint="Danh sách và phê duyệt"
            icon={<Building2 className="h-5 w-5" />}
          />
          <QuickLink
            href="/admin/payments"
            label="Quản lý thanh toán"
            hint="Giao dịch và hoàn tiền"
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
          <QuickLink
            href="/admin/send-notification"
            label="Gửi thông báo"
            hint="Gửi thông tin đến người dùng"
            icon={<BellRing className="h-5 w-5" />}
          />
          <QuickLink
            href="/admin/reports"
            label="Báo cáo và khiếu nại"
            hint="Kiểm soát chất lượng và kiểm duyệt"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone: "blue" | "green" | "amber" | "violet";
}) {
  const toneClasses = {
    blue: {
      ring: "border-blue-200",
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      badge: "bg-blue-600 text-white",
      text: "text-blue-900",
    },
    green: {
      ring: "border-emerald-200",
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      badge: "bg-emerald-600 text-white",
      text: "text-emerald-900",
    },
    amber: {
      ring: "border-amber-200",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      badge: "bg-amber-500 text-white",
      text: "text-amber-900",
    },
    violet: {
      ring: "border-violet-200",
      bg: "bg-gradient-to-br from-violet-50 to-fuchsia-50",
      badge: "bg-violet-600 text-white",
      text: "text-violet-900",
    },
  }[tone];

  return (
    <div className={`group rounded-2xl border ${toneClasses.ring} ${toneClasses.bg} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className={`rounded-lg p-2 ${toneClasses.badge}`}>{icon}</div>
      </div>
      <p className={`mt-4 text-3xl font-bold ${toneClasses.text}`}>{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  hint,
  icon,
}: {
  href: string;
  label: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-slate-900 p-2 text-white group-hover:bg-blue-600">{icon}</div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{label}</p>
            <p className="truncate text-sm text-slate-500">{hint}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
      </div>
    </Link>
  );
}
