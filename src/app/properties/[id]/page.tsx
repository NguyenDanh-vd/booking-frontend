'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { IProperty } from '@/types/backend';
import PropertyReviews, { IReview } from '@/components/PropertyReviews';
import PropertyGallery from '@/components/PropertyGallery';
import BookingSidebar from '@/components/BookingSidebar'; 

// Interface mở rộng cho trang chi tiết (kèm Reviews)
interface IPropertyDetail extends IProperty {
  reviews?: IReview[];
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Lấy user object thay vì chỉ isLoggedIn để truyền xuống Sidebar
  const { user } = useAuth(); 

  const [property, setProperty] = useState<IPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch dữ liệu phòng
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await apiGet<IPropertyDetail | { data: IPropertyDetail }>(
          `/properties/${params.id}`
        );

        // Xử lý trường hợp API trả về dạng { data: ... } hoặc trả về trực tiếp
        const data = 'id' in res ? res : res.data;
        
        if (!data) {
          toast.error('Không tìm thấy phòng này!');
          router.push('/');
          return;
        }

        setProperty(data);
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải thông tin phòng');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProperty();
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải thông tin...
      </div>
    );

  if (!property) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      
      {/* --- HEADER: TIÊU ĐỀ & GALLERY --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{property.title}</h1>
        <p className="text-gray-600 mb-6 flex items-center gap-1">
          📍 {property.address}
        </p>

        <PropertyGallery images={property.images || []} />
      </div>

      {/* --- MAIN CONTENT: GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
        
        {/* CỘT TRÁI (2/3): THÔNG TIN CHI TIẾT */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Mô tả */}
          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Giới thiệu chỗ ở</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {property.description || 'Chủ nhà chưa nhập mô tả chi tiết.'}
            </p>
          </div>

          {/* Tiện ích */}
          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tiện nghi nổi bật</h2>
            <ul className="grid grid-cols-2 gap-4 text-gray-600">
              <li className="flex items-center gap-2">📶 Wifi tốc độ cao</li>
              <li className="flex items-center gap-2">❄️ Máy lạnh 2 chiều</li>
              <li className="flex items-center gap-2">🚗 Chỗ đậu xe miễn phí</li>
              <li className="flex items-center gap-2">🍳 Bếp đầy đủ tiện nghi</li>
              <li className="flex items-center gap-2">📺 Smart TV</li>
              <li className="flex items-center gap-2">🚿 Nóng lạnh</li>
            </ul>
          </div>

          {/* Đánh giá */}
          <div className="pt-4">
             <PropertyReviews reviews={property.reviews || []} />
          </div>
        </div>

        {/* CỘT PHẢI (1/3): FORM ĐẶT PHÒNG (STICKY) */}
        <div className="relative md:col-span-1">
          {/* Component BookingSidebar mới */}
          <BookingSidebar property={property} currentUser={user} />
        </div>

      </div>
    </div>
  );
}