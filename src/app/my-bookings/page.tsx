'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { apiGet, apiPost } from '@/utils/api';
import { IBooking } from '@/types/backend'; // Đảm bảo IBooking trong types đã update đủ trường
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MessageSquare, Calendar, MapPin, Search, DollarSign, Loader2 } from 'lucide-react';
import ReviewModal from '@/components/ReviewModal';
import { getErrorMessage } from '@/utils/error';

type FilterType = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');

  // State cho Review
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: number, title: string } | null>(null);

  // State cho Payment
  const [processingId, setProcessingId] = useState<number | null>(null);

  // State cho Cancel
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchMyBookings = async () => {
    try {
      const data = await apiGet<IBooking[]>('/bookings'); // Đúng endpoint backend
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Xử lý thanh toán (Tích hợp từ code mới)
  const handlePayment = async (bookingId: number) => {
    console.log('Frontend: Attempting payment for booking:', bookingId);
    setProcessingId(bookingId);
    try {
      const response = await apiPost('/payments', {
        bookingId: bookingId,
        provider: 'VNPAY'
      });
      console.log('Frontend: Payment response:', response);
      toast.success('Thanh toán thành công!');
      fetchMyBookings(); // Reload lại data để cập nhật trạng thái
    } catch (error: unknown) {
      console.error('Frontend: Payment error:', error);
      const msg = getErrorMessage(error);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setProcessingId(null);
    }
  };

  // Xử lý hủy phòng
  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy phòng này?')) return;
    setCancellingId(bookingId);
    try {
      await apiPost(`/bookings/${bookingId}/cancel`, {});
      toast.success('Đã hủy phòng thành công!');
      fetchMyBookings();
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (filter === 'ALL') return true;
      if (filter === 'UPCOMING') return ['PENDING', 'CONFIRMED'].includes(booking.status);
      if (filter === 'COMPLETED') return booking.status === 'COMPLETED';
      if (filter === 'CANCELLED') return booking.status === 'CANCELLED';
      return true;
    });
  }, [bookings, filter]);

  const getStatusStyle = (status: string) => {
    const base = "ring-1 shadow-sm font-bold";
    switch (status) {
      case 'CONFIRMED': return `${base} bg-green-50 text-green-700 ring-green-600/20`;
      case 'PENDING': return `${base} bg-yellow-50 text-yellow-700 ring-yellow-600/20`;
      case 'CANCELLED': return `${base} bg-red-50 text-red-700 ring-red-600/20`;
      case 'COMPLETED': return `${base} bg-blue-50 text-blue-700 ring-blue-600/20`;
      default: return `${base} bg-gray-50 text-gray-700 ring-gray-200`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ thanh toán';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CANCELLED': return 'Đã hủy';
      case 'COMPLETED': return 'Hoàn thành';
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
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Chuyến đi của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý và xem lại lịch sử các chuyến đi</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Search size={16} /> Tìm chỗ ở mới
        </Link>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 p-2 rounded-2xl w-fit">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key as FilterType)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
              }`}
          >
            {key === 'ALL' ? 'Tất cả' : key === 'UPCOMING' ? 'Sắp tới' : key === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
          </button>
        ))}
      </div>

      {/* BOOKING LIST */}
      <div className="grid gap-6">
        {filteredBookings.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">Không tìm thấy chuyến đi nào phù hợp.</p>
          </div>
        )}

        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group shadow-sm">

            {/* ẢNH PHÒNG */}
            <div className="relative w-full md:w-72 h-52 md:h-auto overflow-hidden shrink-0">
              <Image
                src={booking.property.images?.[0] || '/placeholder.jpg'}
                alt={booking.property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest backdrop-blur-md ${getStatusStyle(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            </div>

            {/* THÔNG TIN */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/properties/${booking.property.id}`}>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{booking.property.title}</h2>
                </Link>

                <p className="text-gray-500 text-sm flex items-center mb-4 mt-2">
                  <MapPin size={16} className="mr-1.5 shrink-0" /> {booking.property.address}
                </p>

                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                  <Calendar size={16} className="text-blue-600" />
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(booking.checkIn).toLocaleDateString('vi-VN')} → {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* FOOTER CARD */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap justify-between items-end gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Tổng thanh toán</p>
                  <p className="font-black text-xl text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.totalPrice))}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* 1. Nút Chi tiết */}
                  <Link href={`/properties/${booking.property.id}`} className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
                    Chi tiết
                  </Link>


                  {/* 2. Nút Thanh toán (Chỉ hiện khi PENDING hoặc CONFIRMED) */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => router.push('/checkout?bookingId=' + booking.id)}
                      disabled={processingId === booking.id}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
                      Thanh toán
                    </button>
                  )}

                  {/* 2.5. Nút Hủy phòng (Chỉ hiện khi PENDING hoặc CONFIRMED) */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : 'Hủy phòng'}
                    </button>
                  )}

                  {/* 3. Nút Đánh giá (Chỉ hiện khi COMPLETED & chưa review) */}
                  {booking.status === 'COMPLETED' && !booking.hasReviewed && ( // Giả sử backend trả về hasReviewed
                    <button
                      onClick={() => { setSelectedBooking({ id: booking.id, title: booking.property.title }); setIsReviewOpen(true); }}
                      className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition shadow-sm flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Viết đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        bookingId={selectedBooking?.id || null}
        propertyTitle={selectedBooking?.title || ''}
        onSuccess={fetchMyBookings}
      />
    </div>
  );
}