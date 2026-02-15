"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPatch } from "@/utils/api";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Building2,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import type { IProperty } from "@/types/backend";

export default function MyPropertiesPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await apiGet<IProperty[]>("/properties/host");
        setProperties(Array.isArray(response) ? response : []);
      } catch {
        toast.error("Không thể tải danh sách tài sản");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      void fetchMyProperties();
    }
  }, [isLoggedIn]);

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/properties/${id}`);
      toast.success("Đã xóa chỗ nghỉ thành công");
      setProperties((prev) => prev.filter((item) => item.id !== id));
      setShowDeleteModal(null);
    } catch {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const handleToggleStatus = async (property: IProperty) => {
    const nextStatus = property.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingStatusId(property.id);
    try {
      await apiPatch(`/properties/${property.id}`, { status: nextStatus });
      setProperties((prev) =>
        prev.map((item) =>
          item.id === property.id ? { ...item, status: nextStatus } : item
        )
      );
      toast.success(
        nextStatus === "INACTIVE"
          ? "Đã ngưng hoạt động chỗ nghỉ"
          : "Đã kích hoạt lại chỗ nghỉ"
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái chỗ nghỉ");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const stats = useMemo(() => {
    const total = properties.length;
    const active = properties.filter((item) => item.status === "ACTIVE").length;
    const inactive = properties.filter((item) => item.status === "INACTIVE").length;
    const maintenance = properties.filter((item) => item.status === "MAINTENANCE").length;
    return { total, active, inactive, maintenance };
  }, [properties]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Nhà cho thuê của tôi</h1>
              <p className="mt-2 text-slate-200">
                Quản lý tài sản, trạng thái vận hành và cập nhật nhanh thông tin chỗ nghỉ.
              </p>
            </div>

            <Link
              href="/properties/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <Plus size={20} />
              Đăng chỗ nghỉ mới
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tổng tài sản" value={stats.total} tone="blue" />
          <StatCard label="Đang hoạt động" value={stats.active} tone="green" />
          <StatCard label="Ngưng hoạt động" value={stats.inactive} tone="slate" />
          <StatCard label="Bảo trì" value={stats.maintenance} tone="amber" />
        </section>

        {properties.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Building2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Bạn chưa có chỗ nghỉ nào</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Bắt đầu đăng tài sản đầu tiên để tiếp cận khách hàng và tăng doanh thu ngay hôm nay.
            </p>
            <Link
              href="/properties/create"
              className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Bắt đầu ngay
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <article
                key={property.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Building2 size={34} />
                    </div>
                  )}

                  <div className="absolute left-3 top-3">
                    <PropertyStatusBadge status={property.status} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                    {property.title}
                  </h3>
                  <p className="mt-2 flex line-clamp-1 items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={15} />
                    {property.address}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-lg font-bold text-blue-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(property.pricePerNight))}
                      </p>
                      <p className="text-xs text-slate-500">/ đêm</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(property)}
                        disabled={updatingStatusId === property.id}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          property.status === "ACTIVE"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {updatingStatusId === property.id
                          ? "Đang cập nhật..."
                          : property.status === "ACTIVE"
                          ? "Ngưng hoạt động"
                          : "Kích hoạt lại"}
                      </button>
                      <button
                        onClick={() => router.push(`/properties/edit/${property.id}`)}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(property.id)}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>
              <h3 className="mb-2 text-center text-lg font-bold text-slate-900">Xác nhận xóa?</h3>
              <p className="mb-6 text-center text-sm text-slate-500">
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-bold text-white transition hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "slate" | "amber";
}) {
  const tones = {
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-800",
    green:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800",
    slate: "border-slate-200 bg-gradient-to-br from-slate-50 to-gray-100 text-slate-800",
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tones}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function PropertyStatusBadge({ status }: { status: IProperty["status"] }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/90 px-2.5 py-1 text-xs font-bold text-emerald-700 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Đang hoạt động
      </span>
    );
  }

  if (status === "INACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200/90 px-2.5 py-1 text-xs font-bold text-slate-700 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-slate-500" />
        Ngưng hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100/90 px-2.5 py-1 text-xs font-bold text-amber-700 backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Bảo trì
    </span>
  );
}
