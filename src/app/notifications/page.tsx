'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/utils/api';
import { INotification } from '@/types/backend.d';
import Link from 'next/link';
import { Bell, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState<number | null>(null);

    const fetchNotifications = async () => {
        try {
            const data = await apiGet<INotification[]>('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (notificationId: number) => {
        setMarkingId(notificationId);
        try {
            await apiPatch(`/notifications/${notificationId}/read`, {});
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            toast.success('Đã đánh dấu đã đọc');
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setMarkingId(null);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT': return <CheckCircle size={20} className="text-green-600" />;
            case 'BOOKING': return <Clock size={20} className="text-blue-600" />;
            case 'SYSTEM': return <Bell size={20} className="text-orange-600" />;
            default: return <Bell size={20} className="text-gray-600" />;
        }
    };

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'PAYMENT': return 'border-l-green-500 bg-green-50';
            case 'BOOKING': return 'border-l-blue-500 bg-blue-50';
            case 'SYSTEM': return 'border-l-orange-500 bg-orange-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 bg-white min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Thông báo</h1>
                    <p className="text-gray-500 mt-1">Xem tất cả thông báo của bạn</p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                    Về trang chủ
                </Link>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="grid gap-4">
                {notifications.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Bell size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Không có thông báo nào.</p>
                    </div>
                )}

                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`bg-white border-l-4 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${notification.isRead ? 'opacity-75' : 'shadow-sm'
                            } ${getNotificationStyle(notification.type)}`}
                    >

                        <div className="p-6 flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold text-gray-900 ${notification.isRead ? 'text-gray-600' : ''}`}>
                                            {notification.title}
                                        </h3>
                                        {notification.sender && (
                                            <p className="text-sm text-blue-600 font-medium mt-1">
                                                Từ: {notification.sender.fullName} ({notification.sender.role})
                                            </p>
                                        )}
                                        <p className={`text-gray-600 mt-1 ${notification.isRead ? 'text-gray-500' : ''}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            disabled={markingId === notification.id}
                                            className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {markingId === notification.id ? (
                                                <Loader2 className="animate-spin" size={14} />
                                            ) : (
                                                <CheckCircle size={14} />
                                            )}
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}