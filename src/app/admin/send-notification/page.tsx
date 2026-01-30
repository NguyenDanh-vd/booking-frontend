'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { apiPost, apiGet } from '@/utils/api';
import { Send } from 'lucide-react';

interface Host {
    id: number;
    fullName: string;
    email: string;
}

interface ApiResponse<T> {
    data: T;
}

export default function SendNotificationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [hosts, setHosts] = useState<Host[]>([]);
    const [selectedHostId, setSelectedHostId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Kiểm tra quyền Admin
    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/profile');
            return;
        }
    }, [user, router]);

    // Lấy danh sách Host
    useEffect(() => {
        const fetchHosts = async () => {
            try {
                setLoading(true);
                const response = await apiGet<ApiResponse<Host[]>>('/users/admin/users?role=HOST');
                setHosts(response.data || []);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách Host:', error);
                toast.error('Không thể tải danh sách Host');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchHosts();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedHostId || !title.trim() || !message.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSending(true);
            await apiPost<unknown>('/notifications/admin', {
                userId: selectedHostId, // ID của HOST được chọn (người nhận thông báo)
                senderId: user?.id, // ID của Admin hiện tại (người gửi thông báo)
                title: title.trim(),
                message: message.trim(),
                type: 'SYSTEM',
            });

            toast.success('Gửi thông báo thành công!');
            setSelectedHostId(null);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error('Lỗi khi gửi thông báo:', error);
            toast.error('Không thể gửi thông báo');
        } finally {
            setSending(false);
        }
    };

    if (user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Send className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Gửi thông báo cho Host</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Chọn Host */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn Host (vai trò HOST) nhận thông báo
                            </label>
                            <select
                                value={selectedHostId || ''}
                                onChange={(e) => setSelectedHostId(Number(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Chọn Host --</option>
                                {hosts.map((host) => (
                                    <option key={host.id} value={host.id}>
                                        {host.fullName}
                                    </option>
                                ))}
                            </select>
                            {selectedHostId && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="text-sm text-blue-800">
                                        <strong>Người gửi:</strong> {user?.fullName} (ADMIN)
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        <strong>Người nhận:</strong> {hosts.find(h => h.id === selectedHostId)?.fullName || 'Không tìm thấy'} (HOST)
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        <strong>Email:</strong> {hosts.find(h => h.id === selectedHostId)?.email || 'N/A'}
                                    </div>
                                    {/* Debug info */}
                                    <div className="text-xs text-gray-500 mt-2">
                                        Debug: selectedHostId={selectedHostId}, hosts count={hosts.length}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tiêu đề */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề thông báo
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tiêu đề thông báo..."
                                required
                            />
                        </div>

                        {/* Nội dung */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung thông báo
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Nhập nội dung thông báo..."
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={sending}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/dashboard')}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>

                    {loading && (
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Đang tải danh sách Host...
                            </div>
                        </div>
                    )}

                    {!loading && hosts.length === 0 && (
                        <div className="mt-6 text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 font-medium">Không có Host nào trong hệ thống</p>
                            <p className="text-yellow-600 text-sm mt-1">Vui lòng tạo Host trước khi gửi thông báo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}