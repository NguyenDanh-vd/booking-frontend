'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/utils/api';
import { IPayment } from '@/types/backend.d';
import Link from 'next/link';
import { Calendar, DollarSign, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';

export default function HostPaymentsPage() {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPendingPayments = async () => {
        try {
            const data = await apiGet<IPayment[]>('/payments/host/pending');
            setPayments(data);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const handleUpdateStatus = async (
        paymentId: number,
        status: 'SUCCESS' | 'FAILED' | 'REFUNDED'
    ) => {
        if (
            !window.confirm(
                `Bạn có chắc chắn muốn ${status === 'SUCCESS'
                    ? 'xác nhận'
                    : status === 'FAILED'
                        ? 'từ chối'
                        : 'hoàn tiền'
                } thanh toán này?`
            )
        )
            return;

        setProcessingId(paymentId);
        try {
            await apiPatch(`/payments/${paymentId}/status`, { status });
            toast.success('Cập nhật trạng thái thành công!');
            fetchPendingPayments();
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'SUCCESS':
                return 'Thành công';
            case 'FAILED':
                return 'Thất bại';
            case 'REFUNDED':
                return 'Hoàn tiền';
            default:
                return status;
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 bg-white min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Xác nhận thanh toán
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý các thanh toán đang chờ xác nhận
                    </p>
                </div>
            </div>

            {/* PAYMENT LIST */}
            <div className="grid gap-6">
                {payments.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">
                            Không có thanh toán nào đang chờ xác nhận.
                        </p>
                    </div>
                )}

                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group shadow-sm"
                    >
                        {/* ICON */}
                        <div className="relative w-full md:w-24 h-24 md:h-auto flex items-center justify-center bg-yellow-50 shrink-0">
                            <DollarSign size={32} className="text-yellow-600" />
                        </div>

                        {/* THÔNG TIN */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest backdrop-blur-md bg-yellow-50 text-yellow-700 ring-yellow-600/20 ring-1 shadow-sm font-bold">
                                        {getStatusLabel(payment.status)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {payment.provider}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {payment.booking?.property?.title ||
                                        'Chưa có thông tin phòng'}
                                </h3>
                                <p className="text-gray-600 text-sm mb-2">
                                    Khách:{' '}
                                    {payment.booking?.guest?.fullName || 'N/A'} (
                                    {payment.booking?.guest?.email || 'N/A'})
                                </p>
                                <p className="text-gray-500 text-sm flex items-center mb-4 mt-2">
                                    <Calendar size={16} className="mr-1.5 shrink-0" />{' '}
                                    {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                </p>

                                {payment.transactionCode && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Mã giao dịch: {payment.transactionCode}
                                    </p>
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap justify-between items-end gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
                                        Số tiền
                                    </p>
                                    <p className="font-black text-xl text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(Number(payment.amount))}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    {payment.booking?.property?.id ? (
                                        <Link
                                            href={`/properties/${payment.booking.property.id}`}
                                            className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                                        >
                                            Xem phòng
                                        </Link>
                                    ) : (
                                        <span className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-400 cursor-not-allowed">
                                            Xem phòng
                                        </span>
                                    )}

                                    <button
                                        onClick={() =>
                                            handleUpdateStatus(payment.id, 'SUCCESS')
                                        }
                                        disabled={processingId === payment.id}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === payment.id ? (
                                            <Loader2
                                                className="animate-spin"
                                                size={16}
                                            />
                                        ) : (
                                            <CheckCircle size={16} />
                                        )}
                                        Xác nhận
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleUpdateStatus(payment.id, 'FAILED')
                                        }
                                        disabled={processingId === payment.id}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === payment.id ? (
                                            <Loader2
                                                className="animate-spin"
                                                size={16}
                                            />
                                        ) : (
                                            <XCircle size={16} />
                                        )}
                                        Từ chối
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleUpdateStatus(payment.id, 'REFUNDED')
                                        }
                                        disabled={processingId === payment.id}
                                        className="px-5 py-2.5 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === payment.id ? (
                                            <Loader2
                                                className="animate-spin"
                                                size={16}
                                            />
                                        ) : (
                                            <RefreshCw size={16} />
                                        )}
                                        Hoàn tiền
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
