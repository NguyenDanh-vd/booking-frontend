'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import { IProperty } from '@/types/backend';
import Image from 'next/image';
import Link from 'next/link';
import SearchHero from '@/components/SearchHero';
import HeartButton from '@/components/HeartButton'; // Tích hợp nút tim
import { MapPin, Star, Frown } from 'lucide-react';

interface IPropertyResponse {
  data: IProperty[];
}

// Component hiển thị khi đang tải (Skeleton)
const PropertySkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-6 bg-gray-200 rounded-full w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse" />
      <div className="pt-4 flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded-full w-1/3 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [filteredProps, setFilteredProps] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await apiGet<IProperty[] | IPropertyResponse>('/properties');
        
        let finalList: IProperty[] = [];
        if (Array.isArray(res)) {
          finalList = res;
        } else if ('data' in res && Array.isArray(res.data)) {
          finalList = res.data;
        }

        setProperties(finalList);
        setFilteredProps(finalList);
      } catch (error: unknown) {
        console.error('Lỗi tải danh sách:', error);
        setProperties([]); 
        setFilteredProps([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchTerm(keyword);
    if (!keyword.trim()) {
      setFilteredProps(properties);
      return;
    }
    const lowerKeyword = keyword.toLowerCase();
    const results = properties.filter(prop => 
      (prop.title && prop.title.toLowerCase().includes(lowerKeyword)) ||
      (prop.address && prop.address.toLowerCase().includes(lowerKeyword))
    );
    setFilteredProps(results);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      
      {/* 1. Component Search Hero (Banner & Tìm kiếm) */}
      <SearchHero onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {loading ? 'Đang tải...' : filteredProps.length !== properties.length ? 'Kết quả tìm kiếm' : 'Điểm đến nổi bật'}
            </h2>
            <p className="text-gray-500 mt-2">
              {loading ? 'Vui lòng chờ chút...' : `${filteredProps.length} chỗ nghỉ tuyệt vời đang chờ bạn`}
            </p>
          </div>
          
          {/* Bộ lọc nhanh (Visual only) */}
          <div className="hidden md:flex gap-2">
             {['Tất cả', 'Biệt thự', 'Căn hộ', 'Giá tốt'].map((tag, idx) => (
                <span key={idx} className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all ${idx === 0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                  {tag}
                </span>
             ))}
          </div>
        </div>

        {/* 2. Grid Properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* A. Loading State (Skeleton) */}
          {loading && Array.from({ length: 8 }).map((_, i) => (
             <PropertySkeleton key={i} />
          ))}

          {/* B. Data State */}
          {!loading && filteredProps.length > 0 && filteredProps.map((prop) => (
             <div key={prop.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full border border-gray-100">
                
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                   <Link href={`/properties/${prop.id}`}>
                      {prop.images && prop.images.length > 0 ? (
                        <Image
                          src={prop.images[0]}
                          alt={prop.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                          No Image
                        </div>
                      )}
                      {/* Lớp phủ gradient nhẹ ở đáy ảnh để làm nổi bật text nếu cần */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                   </Link>

                   {/* Nút Tim (Wishlist) - Đặt tuyệt đối trên ảnh */}
                   <div className="absolute top-3 right-3 z-20">
                      <HeartButton propertyId={prop.id} />
                   </div>
                   
                   {/* Rating Badge (Giả lập) */}
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-bold text-gray-800">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      4.9
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow relative">
                   <Link href={`/properties/${prop.id}`} className="block flex-grow">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {prop.title}
                        </h3>
                      </div>

                      <p className="text-gray-500 text-sm flex items-center gap-1.5 line-clamp-1 mb-4">
                        <MapPin size={14} className="shrink-0 text-gray-400" /> 
                        {prop.address}
                      </p>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                         <div>
                            <p className="text-xs text-gray-400">Giá mỗi đêm</p>
                            <p className="text-blue-600 font-bold text-lg">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(prop.pricePerNight))}
                            </p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            ➜
                         </div>
                      </div>
                   </Link>
                </div>
             </div>
          ))}

          {/* C. Empty State */}
          {!loading && filteredProps.length === 0 && (
             <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                   <Frown className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Rất tiếc, chúng tôi không tìm thấy chỗ nghỉ nào phù hợp với từ khóa <span className="font-bold text-gray-900">&quot;{searchTerm}&quot;</span> của bạn.
                </p>
                <button 
                  onClick={() => handleSearch('')} 
                  className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
                >
                  Xóa bộ lọc & Xem tất cả
                </button>
             </div>
          )}

        </div>
      </div>
    </main>
  );
}