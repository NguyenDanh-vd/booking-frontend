"use client";

import { useEffect, useState, useMemo } from 'react';
import { adminDataService } from '@/services/admin-data.service';
import { IProperty } from '@/types/backend';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<IProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        adminDataService.getProperties()
            .then(setProperties)
            .finally(() => setLoading(false));
    }, []);

    // Lọc và tìm kiếm
    const filtered = useMemo(() => {
        let data = properties;
        if (search) {
            const s = search.toLowerCase();
            data = data.filter(p =>
                p.title.toLowerCase().includes(s) ||
                p.address.toLowerCase().includes(s) ||
                String(p.id).includes(s)
            );
        }
        if (status) {
            data = data.filter(p => p.status === status);
        }
        return data;
    }, [properties, search, status]);

    // Phân trang
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Thao tác chỉnh sửa/xóa (giả lập, cần bổ sung API thực tế nếu muốn thao tác thật)
    const handleEdit = (id: number) => {
        alert('Chỉnh sửa chỗ nghỉ #' + id + ' (cần bổ sung API thực tế)');
    };
    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa chỗ nghỉ #' + id + '?')) {
            alert('Xóa chỗ nghỉ #' + id + ' (cần bổ sung API thực tế)');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý chỗ nghỉ</h1>
            <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                <input
                    className="border rounded px-3 py-2 w-full md:w-64"
                    placeholder="Tìm kiếm theo tiêu đề, địa chỉ, ID..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="border rounded px-3 py-2 w-full md:w-48"
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    <option value="MAINTENANCE">Bảo trì</option>
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
                                    <th className="p-2 border">Tiêu đề</th>
                                    <th className="p-2 border">Địa chỉ</th>
                                    <th className="p-2 border">Giá/đêm</th>
                                    <th className="p-2 border">Chủ nhà</th>
                                    <th className="p-2 border">Trạng thái</th>
                                    <th className="p-2 border">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(p => (
                                    <tr key={p.id}>
                                        <td className="p-2 border text-center">{p.id}</td>
                                        <td className="p-2 border">{p.title}</td>
                                        <td className="p-2 border">{p.address}</td>
                                        <td className="p-2 border text-right">{p.pricePerNight.toLocaleString('vi-VN')} đ</td>
                                        <td className="p-2 border">{p.owner?.fullName || p.ownerId}</td>
                                        <td className="p-2 border text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : p.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                                        </td>
                                        <td className="p-2 border text-center">
                                            <button className="px-2 py-1 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700" onClick={() => handleEdit(p.id)}>Sửa</button>
                                            <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(p.id)}>Xóa</button>
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
