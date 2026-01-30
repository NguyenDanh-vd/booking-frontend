"use client";

import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { adminDataService } from '@/services/admin-data.service';
import { IBooking } from '@/types/backend';

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        adminDataService.getBookings()
            .then(setBookings)
            .finally(() => setLoading(false));
    }, []);

    // Lọc và tìm kiếm
    const filtered = useMemo(() => {
        let data = bookings;
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(b =>
                b.guest?.fullName?.toLowerCase().includes(s) ||
                b.property?.title?.toLowerCase().includes(s) ||
                String(b.id).includes(s)
            );
        }
        if (status) {
            data = data.filter(b => b.status === status);
        }
        return data;
    }, [bookings, search, status]);

    // Phân trang
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Thao tác duyệt/hủy (giả lập, cần bổ sung API thực tế nếu có)
    const handleApprove = (id: number) => {
        alert('Duyệt booking #' + id + ' (cần bổ sung API thực tế)');
    };
    const handleCancel = (id: number) => {
        alert('Hủy booking #' + id + ' (cần bổ sung API thực tế)');
    };

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý booking</h1>
            <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                    className="border rounded px-3 py-2 w-full md:w-64"
                    placeholder="Tìm kiếm theo tên khách, chỗ nghỉ, ID..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="border rounded px-3 py-2 w-full md:w-48"
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="COMPLETED">Hoàn thành</option>
                </select>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border overflow-x-auto">
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <>
                        <table className="min-w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Khách</th>
                                    <th className="p-2 border">Chỗ nghỉ</th>
                                    <th className="p-2 border">Check-in</th>
                                    <th className="p-2 border">Check-out</th>
                                    <th className="p-2 border">Khách</th>
                                    <th className="p-2 border">Tổng tiền</th>
                                    <th className="p-2 border">Trạng thái</th>
                                    <th className="p-2 border">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(b => (
                                    <tr key={b.id}>
                                        <td className="p-2 border text-center">{b.id}</td>
                                        <td className="p-2 border">{b.guest?.fullName || b.guestId}</td>
                                        <td className="p-2 border">{b.property?.title || b.propertyId}</td>
                                        <td className="p-2 border">{new Date(b.checkIn).toLocaleDateString()}</td>
                                        <td className="p-2 border">{new Date(b.checkOut).toLocaleDateString()}</td>
                                        <td className="p-2 border text-center">{b.guestCount}</td>
                                        <td className="p-2 border text-right">{b.totalPrice.toLocaleString('vi-VN')} đ</td>
                                        <td className="p-2 border text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{b.status}</span>
                                        </td>
                                        <td className="p-2 border text-center">
                                            {b.status === 'PENDING' && (
                                                <>
                                                    <button className="px-2 py-1 bg-green-600 text-white rounded mr-2 hover:bg-green-700" onClick={() => handleApprove(b.id)}>Duyệt</button>
                                                    <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleCancel(b.id)}>Hủy</button>
                                                </>
                                            )}
                                        </td>
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
