'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (keyword: string) => void;
}

export default function SearchHero({ onSearch }: SearchHeroProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] bg-gray-900 flex flex-col items-center justify-center px-4 mb-10 overflow-hidden rounded-b-[3rem]">

      {/* 1. Ảnh nền Banner */}
      <div className="absolute inset-0 z-0">
        {/* Bạn có thể thay đổi link ảnh này bằng ảnh thật của dự án */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 hover:scale-105 transition-transform duration-[20s]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-6e5a513e610a?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      {/* 2. Nội dung chính */}
      <div className="relative z-10 text-center w-full max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Tìm nơi dừng chân lý tưởng
        </h1>
        <p className="text-gray-200 text-lg sm:text-xl font-medium drop-shadow-md">
          Khám phá những homestay, biệt thự nghỉ dưỡng tuyệt vời nhất
        </p>

        {/* 3. Thanh Tìm Kiếm (Search Bar) */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-2 rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 w-full max-w-3xl mx-auto border border-gray-100/20 backdrop-blur-sm overflow-hidden"
        >
          {/* Input Địa điểm */}
          <div className="flex-1 flex items-center px-4 h-12 w-full">
            <MapPin className="text-gray-400 mr-3" size={20} />
            <div className="flex flex-col items-start w-full">
              <span className="text-xs font-bold text-gray-800 ml-1 uppercase">Địa điểm</span>
              <input
                type="text"
                placeholder="Bạn muốn đi đâu?"
                className="w-full outline-none text-gray-600 text-sm bg-transparent placeholder-gray-400"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Dải ngăn cách (ẩn trên mobile) */}
          <div className="hidden sm:block w-[1px] h-8 bg-gray-200"></div>

          {/* Input Ngày (Giả lập để đẹp giao diện) */}
          <div className="flex-1 flex items-center px-4 h-12 w-full border-t sm:border-t-0 border-gray-100 sm:border-none pt-2 sm:pt-0">
            <Calendar className="text-gray-400 mr-3" size={20} />
            <div className="flex flex-col items-start w-full cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition">
              <span className="text-xs font-bold text-gray-800 ml-1 uppercase">Nhận phòng</span>
              <span className="text-sm text-gray-400">Thêm ngày</span>
            </div>
          </div>

          {/* Nút Tìm kiếm */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white h-12 px-8 rounded-full font-bold shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span>Tìm kiếm</span>
          </button>
        </form>
      </div>
    </div>
  );
}