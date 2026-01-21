'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiPost, apiGet, apiDelete } from '@/utils/api'; 
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface HeartButtonProps {
  propertyId: number;
}

export default function HeartButton({ propertyId }: HeartButtonProps) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Kiểm tra xem user đã like chưa
  useEffect(() => {
    const checkStatus = async () => {
      // Nếu chưa đăng nhập thì không cần check
      if (!isLoggedIn) return; 

      try {
        const res = await apiGet<{ isLiked: boolean }>(`/wishlist/${propertyId}/check`);
        if (res && res.isLiked) {
            setIsLiked(true);
        }
      } catch (error) {
        // Log lỗi ra console để debug, nhưng không báo toast làm phiền user
        console.error('Lỗi kiểm tra trạng thái yêu thích:', error);
      }
    };

    checkStatus(); // <--- ĐÃ BỎ COMMENT ĐỂ CHẠY HÀM
  }, [propertyId, isLoggedIn]);

  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để lưu yêu thích');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Đang like -> Bỏ like
        await apiDelete(`/wishlist/${propertyId}`);
        toast.success('Đã xóa khỏi yêu thích');
        setIsLiked(false);
      } else {
        // Chưa like -> Thả tim
        await apiPost('/wishlist', { propertyId });
        toast.success('Đã lưu vào yêu thích');
        setIsLiked(true);
      }
      
      // Nếu đang ở trang wishlist thì refresh để cập nhật danh sách
      if (typeof window !== 'undefined' && window.location.pathname === '/wishlist') {
         router.refresh();
      }

    } catch (error) {
      console.error(error);
      toast.error('Lỗi thao tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="relative hover:opacity-80 transition cursor-pointer group z-10" // Thêm z-10 để chắc chắn nổi lên trên
    >
      <Heart
        size={26}
        className={`
          ${isLiked ? 'fill-red-500 stroke-red-500' : 'fill-black/50 stroke-white'}
          transition-all duration-300
        `}
      />
      {/* Hiệu ứng viền khi hover */}
      <Heart 
         size={26}
         className="absolute top-0 right-0 stroke-white group-hover:scale-110 transition-transform duration-300 opacity-0 group-hover:opacity-100"
      />
    </button>
  );
}