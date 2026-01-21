"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/utils/api";
import { IUser } from "@/types/backend";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await apiGet<IUser[]>("/users/admin/users");
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeRole = async (id: number, newRole: "GUEST" | "HOST" | "ADMIN") => {
        setUpdatingId(id);
        try {
            await apiPatch(`/users/role/${id}`, { role: newRole });
            toast.success("Đổi vai trò thành công");
            fetchUsers();
        } catch {
            toast.error("Lỗi đổi vai trò");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <table className="w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Tên</th>
                            <th className="p-2 border">Vai trò</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="p-2 border text-center">{user.id}</td>
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border">{user.fullName}</td>
                                <td className="p-2 border text-center">{user.role}</td>
                                <td className="p-2 border text-center">
                                    {user.role !== "ADMIN" && (
                                        <select
                                            value={user.role}
                                            disabled={updatingId === user.id}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value as "GUEST" | "HOST" | "ADMIN")}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="GUEST">GUEST</option>
                                            <option value="HOST">HOST</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    )}
                                    {user.role === "ADMIN" && <span>Không thể đổi</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
