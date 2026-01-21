"use client";

import { useEffect, useState, useMemo } from 'react';
import { adminDataService } from '@/services/admin-data.service';
import { IPayment } from '@/types/backend';

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        adminDataService.getPayments()
            .then(setPayments)
            .finally(() => setLoading(false));
    }, []);

    // Lọc và tìm kiếm
    const filtered = useMemo(() => {
        let data = payments;
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(p =>
                p.transactionCode?.toLowerCase().includes(s) ||
                p.provider.toLowerCase().includes(s) ||
                String(p.id).includes(s)
            );
        }
        if (status) {
            data = data.filter(p => p.status === status);
        }
        return data;
    }, [payments, search, status]);

    // Phân trang
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý thanh toán</h1>
            <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                    className="border rounded px-3 py-2 w-full md:w-64"
                    placeholder="Tìm kiếm theo mã giao dịch, nhà cung cấp, ID..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="border rounded px-3 py-2 w-full md:w-48"
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Hoàn tiền</option>
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
                                    <th className="p-2 border">Mã giao dịch</th>
                                    <th className="p-2 border">Số tiền</th>
                                    <th className="p-2 border">Nhà cung cấp</th>
                                    <th className="p-2 border">Trạng thái</th>
                                    <th className="p-2 border">Ngày thanh toán</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(p => (
                                    <tr key={p.id}>
                                        <td className="p-2 border text-center">{p.id}</td>
                                        <td className="p-2 border">{p.transactionCode || '-'}</td>
                                        <td className="p-2 border text-right">{p.amount.toLocaleString('vi-VN')} đ</td>
                                        <td className="p-2 border">{p.provider}</td>
                                        <td className="p-2 border text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : p.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                                        </td>
                                        <td className="p-2 border">{new Date(p.paymentDate).toLocaleString()}</td>
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
