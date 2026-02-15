"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellRing,
  BookCheck,
  Building2,
  CreditCard,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from "lucide-react";

const adminMenu = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/bookings", label: "Booking", icon: BookCheck },
  { href: "/admin/properties", label: "Chỗ nghỉ", icon: Building2 },
  { href: "/admin/payments", label: "Thanh toán", icon: CreditCard },
  { href: "/admin/notifications", label: "Thông báo", icon: BellRing },
  { href: "/admin/reports", label: "Báo cáo", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 p-5 text-white shadow-xl md:block">
          <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/90">Quản trị</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight">Trung tâm điều hành</h1>
          </div>

          <nav className="space-y-2">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-200 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span
                    className={`rounded-lg p-1.5 transition ${
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "bg-white/10 text-cyan-100 group-hover:bg-white/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {adminMenu.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="min-h-screen px-3 pb-6 pt-2 md:px-6 md:py-6">
            <div className="rounded-2xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
