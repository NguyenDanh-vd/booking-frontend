"use client";

import { useEffect, useState, useMemo } from 'react';
import { adminDataService } from '@/services/admin-data.service';
import { INotification } from '@/types/backend';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        adminDataService.getNotifications()
            .then(setNotifications)
            .finally(() => setLoading(false));
    }, []);

    // Lọc và tìm kiếm
    const filtered = useMemo(() => {
        let data = notifications;
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(n =>
                n.title.toLowerCase().includes(s) ||
                n.message.toLowerCase().includes(s) ||
                String(n.id).includes(s) ||
                n.user?.fullName.toLowerCase().includes(s) ||
                n.user?.email.toLowerCase().includes(s)
            );
        }
        if (type) {
            data = data.filter(n => n.type === type);
        }
        return data;
    }, [notifications, search, type]);

    // Phân trang
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý thông báo</h1>
            {/* Bộ lọc, tìm kiếm */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                    className="border rounded px-3 py-2 w-full md:w-64"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung, tên Host, email..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="border rounded px-3 py-2 w-full md:w-48"
                    value={type}
                    onChange={e => { setType(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả loại</option>
                    <option value="SYSTEM">Hệ thống</option>
                    <option value="BOOKING">Booking</option>
                    <option value="PAYMENT">Thanh toán</option>
                </select>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border overflow-x-auto">
                {loading ? (
                    <div>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div>Không có thông báo nào.</div>
                ) : (
                    <>
                        <table className="min-w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Người nhận</th>
                                    <th className="p-2 border">Tiêu đề</th>
                                    <th className="p-2 border">Nội dung</th>
                                    <th className="p-2 border">Loại</th>
                                    <th className="p-2 border">Đã đọc</th>
                                    <th className="p-2 border">Ngày gửi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(n => (
                                    <tr key={n.id}>
                                        <td className="p-2 border text-center">{n.id}</td>
                                        <td className="p-2 border">
                                            {n.user ? (
                                                <div>
                                                    <div className="font-medium">{n.user.fullName}</div>
                                                    <div className="text-xs text-gray-500">{n.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-2 border font-bold">{n.title}</td>
                                        <td className="p-2 border">{n.message}</td>
                                        <td className="p-2 border text-center">{n.type}</td>
                                        <td className="p-2 border text-center">{n.isRead ? '✔️' : ''}</td>
                                        <td className="p-2 border">{new Date(n.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
                            <span>Trang {page} / {totalPages || 1}</span>
                            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
