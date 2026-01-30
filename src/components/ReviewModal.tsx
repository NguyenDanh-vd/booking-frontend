'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { apiPost } from '@/utils/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios'; // 1. Import AxiosError

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
  propertyTitle: string;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, bookingId, propertyTitle, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng viết vài lời nhận xét');
      return;
    }

    setLoading(true);
    try {
      await apiPost('/reviews', {
        bookingId,
        rating,
        comment
      });

      toast.success('Cảm ơn bạn đã đánh giá!');
      onSuccess();
      onClose();
      
      setRating(0);
      setComment('');
      
    } catch (error: unknown) { // 2. Sửa any thành unknown
      console.error(error);
      let message = 'Lỗi khi gửi đánh giá';

      // 3. Kiểm tra nếu là lỗi từ Axios để lấy message từ Backend
      if (error instanceof AxiosError) {
        const backendMsg = error.response?.data?.message;
        message = Array.isArray(backendMsg) ? backendMsg[0] : (backendMsg || message);
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá chuyến đi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Bạn cảm thấy thế nào về <span className="font-bold text-blue-600">{propertyTitle}</span>?
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-transform hover:scale-110 focus:outline-none"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star 
                size={40} 
                className={`transition-colors duration-200 ${
                  star <= (hoverRating || rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-gray-100 text-gray-300'
                }`} 
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
        
        <p className="text-center text-sm font-bold text-gray-600 mb-6 h-5">
            {hoverRating === 1 || rating === 1 ? 'Tệ' : 
             hoverRating === 2 || rating === 2 ? 'Kém' :
             hoverRating === 3 || rating === 3 ? 'Bình thường' :
             hoverRating === 4 || rating === 4 ? 'Tốt' :
             hoverRating === 5 || rating === 5 ? 'Tuyệt vời!' : ''}
        </p>

        <div className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Hãy chia sẻ trải nghiệm của bạn về phòng ốc, tiện nghi và thái độ phục vụ..."
            rows={4}
            className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50"
          ></textarea>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
              }`}
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>

      </div>
    </div>
  );
}