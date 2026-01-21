'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import { IProperty } from '@/types/backend';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Loader2 } from 'lucide-react';
import HeartButton from '@/components/HeartButton'; // Import nút tim vừa tạo

export default function WishlistPage() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Backend cần API: GET /wishlist (Trả về danh sách Property)
        const res = await apiGet<IProperty[]>('/wishlist');
        setProperties(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Danh sách yêu thích</h1>
          <p className="text-gray-500 mt-2">Những địa điểm bạn đang quan tâm</p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Chưa có mục yêu thích nào</h3>
            <p className="text-gray-500 mt-2 mb-6">Hãy thả tim các căn nhà bạn thấy ấn tượng nhé!</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
            >
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <div key={prop.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                
                {/* Image */}
                <Link href={`/properties/${prop.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <Image
                    src={prop.images?.[0] || '/no-image.jpg'}
                    alt={prop.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>

                {/* Nút Tim (Tuyệt đối ở góc ảnh) */}
                <div className="absolute top-3 right-3 z-10">
                   {/* Truyền propertyId vào để nút tự xử lý xóa */}
                   <HeartButton propertyId={prop.id} />
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/properties/${prop.id}`}>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                      {prop.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1 mb-3">
                    <MapPin size={14} /> {prop.address}
                  </p>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-blue-600 font-bold text-lg">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(prop.pricePerNight))}
                      <span className="text-xs text-gray-400 font-normal ml-1">/ đêm</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}