'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import { IProperty } from '@/types/backend';
import Image from 'next/image';

export default function Home() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await apiGet<IProperty[]>('/properties');
        console.log('Is Array:', Array.isArray(data));
        console.log('Properties:', data);

        setProperties(data); // ✅ ĐÚNG
      } catch (error) {
        console.error('Lỗi kết nối:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Danh sách Homestay
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative h-48 bg-gray-200">
              {prop.images?.length ? (
                <Image
                  src={prop.images[0]}
                  alt={prop.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Không có ảnh
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="font-bold text-lg">{prop.title}</h2>
              <p className="text-gray-600 text-sm">{prop.address}</p>
              <p className="text-blue-600 font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(prop.pricePerNight)}{' '}
                / đêm
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
