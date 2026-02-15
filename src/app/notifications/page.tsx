"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  Clock,
  Filter,
  Home,
  Loader2,
  MailOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPatch } from "@/utils/api";
import { getErrorMessage } from "@/utils/error";
import type { INotification } from "@/types/backend";

type NotificationFilter = "ALL" | "UNREAD" | "READ";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");

  const fetchNotifications = async () => {
    try {
      const data = await apiGet<INotification[]>("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: number) => {
    setMarkingId(notificationId);
    try {
      await apiPatch(`/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
      toast.success("Đã đánh dấu đã đọc");
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") return notifications.filter((item) => !item.isRead);
    if (filter === "READ") return notifications.filter((item) => item.isRead);
    return notifications;
  }, [notifications, filter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return <CheckCircle size={20} className="text-emerald-600" />;
      case "BOOKING":
        return <Clock size={20} className="text-blue-600" />;
      case "SYSTEM":
        return <Bell size={20} className="text-amber-600" />;
      default:
        return <Bell size={20} className="text-slate-600" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "border-emerald-200 bg-emerald-50/70";
      case "BOOKING":
        return "border-blue-200 bg-blue-50/70";
      case "SYSTEM":
        return "border-amber-200 bg-amber-50/70";
      default:
        return "border-slate-200 bg-slate-50/70";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Thông báo</h1>
              <p className="mt-2 text-slate-200">
                Theo dõi mọi cập nhật quan trọng về booking, thanh toán và hệ thống.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
            >
              <Home size={18} />
              Về trang chủ
            </Link>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard title="Tổng thông báo" value={notifications.length} icon={<Bell className="h-5 w-5" />} tone="blue" />
          <StatCard title="Chưa đọc" value={unreadCount} icon={<MailOpen className="h-5 w-5" />} tone="amber" />
        </section>

        <section className="mb-4 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <FilterButton
            active={filter === "ALL"}
            label="Tất cả"
            onClick={() => setFilter("ALL")}
          />
          <FilterButton
            active={filter === "UNREAD"}
            label="Chưa đọc"
            onClick={() => setFilter("UNREAD")}
          />
          <FilterButton
            active={filter === "READ"}
            label="Đã đọc"
            onClick={() => setFilter("READ")}
          />
        </section>

        <section className="grid gap-4">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <Bell size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="font-medium text-slate-600">Không có thông báo nào.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                  notification.isRead ? "bg-white/90 opacity-80" : "bg-white"
                } ${getNotificationStyle(notification.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-lg bg-white p-2 shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3
                          className={`text-lg font-bold ${
                            notification.isRead ? "text-slate-600" : "text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        {notification.sender ? (
                          <p className="mt-1 text-sm font-medium text-blue-600">
                            Từ: {notification.sender.fullName} ({notification.sender.role})
                          </p>
                        ) : null}

                        <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(notification.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      {!notification.isRead ? (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          {markingId === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Đánh dấu đã đọc
                        </button>
                      ) : (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Đã đọc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
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
  value: number;
  icon: ReactNode;
  tone: "blue" | "amber";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-800"
      : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <span className="rounded-lg bg-white/80 p-2">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
