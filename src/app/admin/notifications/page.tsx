"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { adminDataService } from "@/services/admin-data.service";
import type { INotification } from "@/types/backend";
import toast from "react-hot-toast";

type NotificationType = INotification["type"] | "";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<NotificationType>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    adminDataService
      .getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Không thể tải danh sách thông báo"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = notifications;

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter(
        (notification) =>
          notification.title?.toLowerCase().includes(query) ||
          notification.message?.toLowerCase().includes(query) ||
          String(notification.id).includes(query) ||
          notification.user?.fullName?.toLowerCase().includes(query) ||
          notification.user?.email?.toLowerCase().includes(query)
      );
    }

    if (type) {
      data = data.filter((notification) => notification.type === type);
    }

    return data;
  }, [notifications, search, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 py-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-52 w-52 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-44 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Quản lý thông báo</h1>
            <p className="mt-2 text-slate-200">
              Theo dõi thông báo hệ thống, booking và thanh toán gửi tới người dùng.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <BellRing className="h-4 w-4" />
            Tổng thông báo: {loading ? "..." : notifications.length}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Tìm theo tiêu đề, nội dung, người nhận hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full min-w-52 rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as NotificationType);
                  setPage(1);
                }}
              >
                <option value="">Tất cả loại</option>
                <option value="SYSTEM">Hệ thống</option>
                <option value="BOOKING">Booking</option>
                <option value="PAYMENT">Thanh toán</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Không có thông báo phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">
              Hãy thử thay đổi từ khóa hoặc bộ lọc để xem dữ liệu.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                Kết quả: {filtered.length}
              </span>
              {type ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                  Bộ lọc: {type}
                </span>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Người nhận</th>
                    <th className="px-4 py-3 text-left font-semibold">Tiêu đề</th>
                    <th className="px-4 py-3 text-left font-semibold">Nội dung</th>
                    <th className="px-4 py-3 text-left font-semibold">Loại</th>
                    <th className="px-4 py-3 text-left font-semibold">Đã đọc</th>
                    <th className="px-4 py-3 text-left font-semibold">Ngày gửi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((notification) => (
                    <tr
                      key={notification.id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{notification.id}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {notification.user ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {notification.user.fullName}
                            </div>
                            <div className="text-xs text-slate-500">{notification.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{notification.title}</td>
                      <td className="px-4 py-3 text-slate-700">{notification.message}</td>
                      <td className="px-4 py-3">
                        <NotificationTypeBadge type={notification.type} />
                      </td>
                      <td className="px-4 py-3">
                        {notification.isRead ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã đọc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Chưa đọc
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(notification.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Trang {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function NotificationTypeBadge({ type }: { type: INotification["type"] }) {
  if (type === "SYSTEM") {
    return (
      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
        Hệ thống
      </span>
    );
  }

  if (type === "BOOKING") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
        Booking
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      Thanh toán
    </span>
  );
}
