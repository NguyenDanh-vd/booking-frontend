"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { adminDataService } from "@/services/admin-data.service";
import type { IPayment } from "@/types/backend";
import toast from "react-hot-toast";

type PaymentStatus = IPayment["status"] | "";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    adminDataService
      .getPayments()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Không thể tải danh sách thanh toán"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = payments;

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter(
        (payment) =>
          payment.transactionCode?.toLowerCase().includes(query) ||
          payment.provider.toLowerCase().includes(query) ||
          String(payment.id).includes(query)
      );
    }

    if (status) {
      data = data.filter((payment) => payment.status === status);
    }

    return data;
  }, [payments, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleRefund = (payment: IPayment) => {
    toast(
      `Hoàn tiền #${payment.id} (${payment.amount.toLocaleString(
        "vi-VN"
      )} đ) - cần bổ sung API thực tế`
    );
  };

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 py-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-52 w-52 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-44 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Quản lý thanh toán</h1>
            <p className="mt-2 text-slate-200">
              Theo dõi giao dịch, trạng thái xử lý và thao tác hoàn tiền nhanh.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <CreditCard className="h-4 w-4" />
            Tổng giao dịch: {loading ? "..." : payments.length}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Tìm theo mã giao dịch, nhà cung cấp hoặc ID..."
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
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as PaymentStatus);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="FAILED">Thất bại</option>
                <option value="REFUNDED">Hoàn tiền</option>
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
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                Kết quả: {filtered.length}
              </span>
              {status ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                  Bộ lọc: {status}
                </span>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Mã giao dịch</th>
                    <th className="px-4 py-3 text-left font-semibold">Số tiền</th>
                    <th className="px-4 py-3 text-left font-semibold">Nhà cung cấp</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Ngày thanh toán</th>
                    <th className="px-4 py-3 text-left font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((payment) => (
                    <tr key={payment.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-700">{payment.id}</td>
                      <td className="px-4 py-3 text-slate-700">{payment.transactionCode || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {payment.amount.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-3 text-slate-700">{payment.provider}</td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(payment.paymentDate).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        {payment.status === "SUCCESS" ? (
                          <button
                            onClick={() => handleRefund(payment)}
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Hoàn tiền
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Không khả dụng
                          </span>
                        )}
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

function PaymentStatusBadge({ status }: { status: IPayment["status"] }) {
  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Thành công
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Chờ xử lý
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        Thất bại
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">
      Hoàn tiền
    </span>
  );
}
