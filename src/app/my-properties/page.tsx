'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiDelete } from '@/utils/api';
import toast from 'react-hot-toast';
import { Plus, Home, MapPin, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { IProperty } from '@/types/backend';

export default function MyPropertiesPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/login');
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const res = await apiGet<IProperty[]>('/properties/host');
        if (Array.isArray(res)) setProperties(res);
      } catch {
        console.error("Lỗi tải danh sách nhà");
        toast.error("Không thể tải danh sách tài sản");
      } finally {
        setLoading(false);
      }
    };
    if (isLoggedIn) fetchMyProperties();
  }, [isLoggedIn]);

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/properties/${id}`);
      toast.success('Đã xóa chỗ nghỉ thành công');
      setProperties(prev => prev.filter(p => p.id !== id));
      setShowDeleteModal(null);
    } catch {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nhà cho thuê của tôi</h1>
            <p className="text-muted mt-1 transition-colors">Quản lý {properties.length} tài sản đang hoạt động của bạn.</p>
          </div>
          <Link
            href="/properties/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-foreground font-bold rounded-xl transition transform hover:-translate-y-0.5"
            style={{
              boxShadow:
                '0 0 24px 0 rgba(255,255,255,0.15), 0 4px 32px 0 rgba(0,0,0,0.25)'
            }}
          >
            <Plus size={20} /> Đăng chỗ nghỉ mới
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-card rounded-3xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Home size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bạn chưa có chỗ nghỉ nào</h3>
            <p className="text-muted max-w-md mb-8">Trở thành Host ngay hôm nay để kiếm thêm thu nhập từ căn hộ của bạn.</p>
            <Link href="/properties/create" className="px-8 py-3 bg-primary text-white font-bold rounded-xl transition shadow-md">Bắt đầu ngay</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="relative aspect-[4/3] bg-background">
                  {property.images?.[0] ? <Image src={property.images[0]} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-muted"><Home size={32} /></div>}
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-green-600 shadow-sm flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Hoạt động</div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold line-clamp-1 text-lg group-hover:text-primary transition-colors">{property.title}</h3>
                  <p className="text-muted text-sm mb-4 mt-2 flex items-center gap-1.5 line-clamp-1"><MapPin size={15} /> {property.address}</p>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(property.pricePerNight))}</span>
                      <span className="text-xs text-muted"> /đêm</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/properties/edit/${property.id}`)} className="p-2 hover:bg-background rounded-full text-muted hover:text-primary transition-colors"><Edit size={18} /></button>
                      <button onClick={() => setShowDeleteModal(property.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-muted hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full transition-colors">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertCircle size={24} /></div>
              <h3 className="text-lg font-bold text-center mb-2">Xác nhận xóa?</h3>
              <p className="text-center text-muted text-sm mb-6">Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-border font-bold text-muted hover:bg-background transition">Hủy</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 py-2.5 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 transition shadow-lg">Xóa</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}