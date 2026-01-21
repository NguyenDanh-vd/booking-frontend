'use client';

import Link from 'next/link';
import { Home, Map } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-lg mx-auto">
        
        {/* Hình ảnh minh họa (SVG hoặc Image) */}
        <div className="relative w-64 h-64 mx-auto mb-8 animate-bounce-slow">
           {/* Bạn có thể thay bằng thẻ <Image> nếu có ảnh đẹp, ở đây dùng SVG minh họa */}
           <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-200" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.17218 14.8284L12.0006 17.6569L14.829 14.8284" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.0006 4V17.6569" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path opacity="0.5" d="M19 19C19 19 16.5 21 12 21C7.5 21 5 19 5 19" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
           </svg>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-6xl text-blue-600">
             404
           </div>
        </div>

        {/* Nội dung text */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Oops! Bạn bị lạc đường rồi?
        </h1>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Có vẻ như địa điểm bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Đừng lo, hãy quay lại trang chủ để bắt đầu chuyến đi mới nhé!
        </p>

        {/* Nút điều hướng */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300"
          >
            <Home size={20} />
            Về trang chủ
          </Link>
          
          <Link 
            href="/properties" 
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-full font-bold hover:bg-gray-50 hover:border-blue-200 transition-all duration-300"
          >
            <Map size={20} />
            Xem danh sách phòng
          </Link>
        </div>

      </div>
    </div>
  );
}