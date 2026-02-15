'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiGet } from '@/utils/api';
import { IPayment } from '@/types/backend.d';
import Link from 'next/link';
import { Calendar, CreditCard, Loader2, Search } from 'lucide-react';

type FilterType = 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export default function MyPaymentsPage() {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');

    const fetchMyPayments = async () => {
        try {
            const data = await apiGet<IPayment[]>('/payments');
            console.log('Payments data:', data);
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            if (filter === 'ALL') return true;
            return payment.status === filter;
        });
    }, [payments, filter]);

    const totals = useMemo(() => {
        const totalCount = payments.length;
        const totalAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const filteredCount = filteredPayments.length;
        const filteredAmount = filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        return { totalCount, totalAmount, filteredCount, filteredAmount };
    }, [payments, filteredPayments]);

    const getStatusStyle = (status: string) => {
        const base = "ring-1 shadow-sm font-bold";
        switch (status) {
            case 'SUCCESS': return `${base} bg-green-50 text-green-700 ring-green-600/20`;
            case 'PENDING': return `${base} bg-yellow-50 text-yellow-700 ring-yellow-600/20`;
            case 'FAILED': return `${base} bg-red-50 text-red-700 ring-red-600/20`;
            case 'REFUNDED': return `${base} bg-blue-50 text-blue-700 ring-blue-600/20`;
            default: return `${base} bg-gray-50 text-gray-700 ring-gray-200`;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Đang xử lý';
            case 'SUCCESS': return 'Thành công';
            case 'FAILED': return 'Thất bại';
            case 'REFUNDED': return 'Hoàn tiền';
            default: return status;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 bg-white min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Lịch sử thanh toán</h1>
                    <p className="text-gray-500 mt-1">Quản lý và xem lại lịch sử các thanh toán</p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                    <Search size={16} /> Tìm chỗ ở mới
                </Link>
            </div>

            {/* TOTALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    <span className="text-sm text-gray-500">Tổng số thanh toán</span>
                    <span className="mt-3 font-extrabold text-2xl text-gray-900">{totals.totalCount}</span>
                    <span className="text-xs text-gray-400">Lọc: {totals.filteredCount}</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    <span className="text-sm text-gray-500">Tổng doanh thu</span>
                    <span className="mt-3 font-extrabold text-2xl text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.totalAmount)}
                    </span>
                    <span className="text-xs text-gray-400">Lọc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.filteredAmount)}</span>
                </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 p-2 rounded-2xl w-fit">
                {['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].map((key) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key as FilterType)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
                            }`}
                    >
                        {key === 'ALL' ? 'Tất cả' : key === 'PENDING' ? 'Đang xử lý' : key === 'SUCCESS' ? 'Thành công' : key === 'FAILED' ? 'Thất bại' : 'Hoàn tiền'}
                    </button>
                ))}
            </div>

            {/* PAYMENT LIST */}
            <div className="grid gap-6">
                {filteredPayments.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">Không tìm thấy thanh toán nào phù hợp.</p>
                    </div>
                )}

                {filteredPayments.map((payment) => (
                    <div key={payment.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group shadow-sm">

                        {/* ICON */}
                        <div className="relative w-full md:w-24 h-24 md:h-auto flex items-center justify-center bg-blue-50 shrink-0">
                            <CreditCard size={32} className="text-blue-600" />
                        </div>

                        {/* THÔNG TIN */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest backdrop-blur-md ${getStatusStyle(payment.status)}`}>
                                        {getStatusLabel(payment.status)}
                                    </span>
                                    <span className="text-sm text-gray-500">{payment.provider}</span>
                                </div>

                                <p className="text-gray-500 text-sm flex items-center mb-4 mt-2">
                                    <Calendar size={16} className="mr-1.5 shrink-0" /> {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                </p>

                                {payment.transactionCode && (
                                    <p className="text-sm text-gray-600 mb-2">Mã giao dịch: {payment.transactionCode}</p>
                                )}
                            </div>

                            {/* FOOTER CARD */}
                            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap justify-between items-end gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Số tiền</p>
                                    <p className="font-black text-xl text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(payment.amount))}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Link href={`/my-bookings`} className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
                                        Xem booking
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}