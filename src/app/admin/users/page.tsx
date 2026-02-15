"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { apiGet, apiPatch } from "@/utils/api";
import type { IUser } from "@/types/backend";
import toast from "react-hot-toast";

type UserRole = "GUEST" | "HOST" | "ADMIN";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await apiGet<IUser[]>("/users/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Khong the tai danh sach nguoi dung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleChangeRole = async (id: number, newRole: UserRole) => {
    setUpdatingId(id);
    try {
      await apiPatch(`/users/role/${id}`, { role: newRole });
      toast.success("Doi vai tro thanh cong");
      await fetchUsers();
    } catch {
      toast.error("Loi doi vai tro");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleVerification = async (id: number, nextStatus: boolean) => {
    setVerifyingId(id);
    try {
      await apiPatch(`/users/verify/${id}`, { isVerified: nextStatus });
      toast.success(nextStatus ? "Da xac thuc tai khoan" : "Da bo xac thuc tai khoan");
      await fetchUsers();
    } catch {
      toast.error("Loi cap nhat xac thuc");
    } finally {
      setVerifyingId(null);
    }
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
            <h1 className="text-3xl font-bold text-white">Quan ly nguoi dung</h1>
            <p className="mt-2 text-slate-200">
              Theo doi tai khoan, vai tro va xac thuc nhanh.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <Users className="h-4 w-4" />
            Tong tai khoan: {loading ? "..." : users.length}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Ho ten</th>
                  <th className="px-4 py-3 text-left font-semibold">Vai tro</th>
                  <th className="px-4 py-3 text-left font-semibold">Xac thuc</th>
                  <th className="px-4 py-3 text-left font-semibold">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-700">{user.id}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3 text-slate-900">{user.fullName}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isVerified
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {user.isVerified ? "Da xac thuc" : "Chua xac thuc"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2">
                            <span className="sr-only">Doi vai tro</span>
                            <select
                              value={user.role}
                              disabled={updatingId === user.id}
                              onChange={(e) =>
                                handleChangeRole(user.id, e.target.value as UserRole)
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="GUEST">GUEST</option>
                              <option value="HOST">HOST</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </label>

                          <button
                            type="button"
                            disabled={verifyingId === user.id}
                            onClick={() =>
                              handleToggleVerification(user.id, !Boolean(user.isVerified))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {verifyingId === user.id
                              ? "Dang cap nhat..."
                              : user.isVerified
                              ? "Bo xac thuc"
                              : "Xac thuc"}
                          </button>

                          {updatingId === user.id ? (
                            <span className="text-xs font-medium text-slate-500">
                              Dang cap nhat vai tro...
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Khoa vai tro
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: IUser["role"] }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
        ADMIN
      </span>
    );
  }

  if (role === "HOST") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        HOST
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
      GUEST
    </span>
  );
}
