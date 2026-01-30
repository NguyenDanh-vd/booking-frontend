"use client";

import { useEffect, useState, useMemo } from 'react';
import { adminDataService } from '@/services/admin-data.service';

// 1. Định nghĩa kiểu dữ liệu cho Report
// Bạn có thể chuyển cái này sang file types.ts nếu muốn tái sử dụng
interface ReportItem {
    id: number;
    type: string;
    content?: string; // Dấu ? nghĩa là có thể null hoặc undefined
    message?: string;
    sender?: {
        fullName?: string;
    };
    senderId?: string | number;
    createdAt?: string;
}

export default function AdminReportsPage() {
    // 2. Áp dụng type cho useState
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        adminDataService.getReports()
            .then((res) => {
                // Kiểm tra an toàn: Đảm bảo res là mảng trước khi set state
                // Nếu API trả về { data: [...] } thì sửa thành res.data
                if (Array.isArray(res)) {
                    setReports(res as ReportItem[]);
                } else {
                    setReports([]);
                }
            })
            .catch((err) => {
                console.error("Lỗi tải báo cáo:", err);
                setReports([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Lọc và tìm kiếm
    const filtered = useMemo(() => {
        // Đảm bảo data luôn là mảng
        let data: ReportItem[] = Array.isArray(reports) ? reports : [];
        
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(r =>
                (r.content || r.message || '').toLowerCase().includes(s) ||
                String(r.id).includes(s)
            );
        }
        if (type) {
            data = data.filter(r => r.type === type);
        }
        return data;
    }, [reports, search, type]);

    // Phân trang
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Thao tác duyệt/xử lý
    const handleResolve = (id: number) => {
        alert('Đã xử lý báo cáo #' + id + ' (cần bổ sung API thực tế)');
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Báo cáo & khiếu nại</h1>
            {/* Bộ lọc, tìm kiếm */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                    className="border rounded px-3 py-2 w-full md:w-64"
                    placeholder="Tìm kiếm theo nội dung, ID..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="border rounded px-3 py-2 w-full md:w-48"
                    value={type}
                    onChange={e => { setType(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả loại</option>
                    <option value="REPORT">Báo cáo</option>
                    <option value="COMPLAINT">Khiếu nại</option>
                    <option value="VIOLATION">Vi phạm</option>
                </select>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border overflow-x-auto">
                {loading ? (
                    <div>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div>Không có báo cáo nào.</div>
                ) : (
                    <>
                        <table className="min-w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Loại</th>
                                    <th className="p-2 border">Nội dung</th>
                                    <th className="p-2 border">Người gửi</th>
                                    <th className="p-2 border">Ngày gửi</th>
                                    <th className="p-2 border">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 3. TypeScript sẽ tự hiểu r là ReportItem, không cần :any nữa */}
                                {paged.map((r) => (
                                    <tr key={r.id}>
                                        <td className="p-2 border text-center">{r.id}</td>
                                        <td className="p-2 border">{r.type || '-'}</td>
                                        <td className="p-2 border">{r.content || r.message || '-'}</td>
                                        <td className="p-2 border">{r.sender?.fullName || r.senderId || '-'}</td>
                                        <td className="p-2 border">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                                        <td className="p-2 border text-center">
                                            <button className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => handleResolve(r.id)}>Xử lý</button>
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