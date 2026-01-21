'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/utils/api';
import toast from 'react-hot-toast';
import { IProperty, IUser } from '@/types/backend';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/error';

interface BookingSidebarProps {
    property: IProperty;
    currentUser: IUser | null;
}

export default function BookingSidebar({ property, currentUser }: BookingSidebarProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guestCount, setGuestCount] = useState(1);

    // Tính toán tổng tiền tạm thời
    const totalPrice = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;

        // Công thức giống backend (đơn giản hóa)
        // Giá gốc + 10% phí dịch vụ + phí dọn dẹp
        const roomPrice = Number(property.pricePerNight) * diffDays;
        const serviceFee = roomPrice * 0.1;
        const cleaningFee = Number(property.cleaningFee || 0); // Giả sử backend có trả về field này

        return roomPrice + serviceFee + cleaningFee;
    }, [checkIn, checkOut, property.pricePerNight, property.cleaningFee]);

    const handleReserve = async () => {
        if (!currentUser) {
            return router.push('/login');
        }
        if (!checkIn || !checkOut) {
            return toast.error('Vui lòng chọn ngày nhận/trả phòng');
        }
        setLoading(true);
        try {
            await apiPost('/bookings', {
                propertyId: property.id,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guestCount: Number(guestCount)
            });
            toast.success('Đặt phòng thành công! Vui lòng thanh toán.');
            router.push('/my-bookings');
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-8 sticky top-28 max-w-md mx-auto animate-fade-in">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-3xl font-extrabold text-rose-600 drop-shadow">{Number(property.pricePerNight).toLocaleString()} ₫</span>
                    <span className="text-gray-400 text-lg font-medium"> / đêm</span>
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-gray-50">
                <div className="flex border-b border-gray-200">
                    <div className="w-1/2 p-4 border-r border-gray-200 bg-white">
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">Nhận phòng</label>
                        <input
                            type="date"
                            className="w-full outline-none text-base text-gray-700 rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-rose-200 transition"
                            min={new Date().toISOString().split('T')[0]}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                    <div className="w-1/2 p-4 bg-white">
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">Trả phòng</label>
                        <input
                            type="date"
                            className="w-full outline-none text-base text-gray-700 rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-rose-200 transition"
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-4 bg-white">
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">Khách</label>
                    <input
                        type="number"
                        min={1}
                        max={property.maxGuests || 10}
                        className="w-full outline-none text-base text-gray-700 rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-rose-200 transition"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                    />
                </div>
            </div>

            <button
                onClick={handleReserve}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 mb-6 flex justify-center items-center gap-2 text-lg tracking-wide"
            >
                {loading && <Loader2 className="animate-spin" size={22} />}
                {loading ? 'Đang xử lý...' : 'Đặt phòng'}
            </button>

            {/* Hiển thị tính toán tiền */}
            {checkIn && checkOut && totalPrice > 0 && (
                <div className="space-y-3 pt-6 border-t border-gray-100 animate-fade-in">
                    <div className="flex justify-between font-extrabold text-xl text-rose-700 pt-2 border-t border-gray-200">
                        <span>Tổng tiền</span>
                        <span>{totalPrice.toLocaleString()} ₫</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">Chưa bao gồm thuế (nếu có)</p>
                </div>
            )}
        </div>
    );
}