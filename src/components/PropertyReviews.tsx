'use client';

import { Star, User } from 'lucide-react';
import Image from 'next/image';

// Định nghĩa Interface cho Review
export interface IReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    fullName: string;
    avatar?: string;
  };
}

interface PropertyReviewsProps {
  reviews: IReview[];
}

export default function PropertyReviews({ reviews }: PropertyReviewsProps) {
  // Tính điểm trung bình
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-8 border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đánh giá</h3>
        <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!</p>
      </div>
    );
  }

  return (
    <div className="py-10 border-t border-gray-100">
      
      {/* Header: Điểm số tổng quan */}
      <div className="flex items-center gap-2 mb-8">
        <Star size={24} className="fill-yellow-400 text-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-900">
          {averageRating} <span className="text-gray-400 font-normal text-lg">({reviews.length} đánh giá)</span>
        </h2>
      </div>

      {/* Danh sách Reviews (Grid 2 cột) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="break-inside-avoid">
            
            {/* Thông tin người dùng */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {review.user.avatar ? (
                  <Image 
                    src={review.user.avatar} 
                    alt={review.user.fullName} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{review.user.fullName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Số sao & Nội dung */}
            <div className="space-y-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star} 
                     size={12} 
                     className={`${star <= review.rating ? 'fill-black text-black' : 'text-gray-300'}`} 
                   />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}