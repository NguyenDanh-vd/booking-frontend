'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPatch } from '@/utils/api'; 
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, X, DollarSign, MapPin, Home, FileText, ArrowLeft, Save } from 'lucide-react';
import { AxiosError } from 'axios';
import { IProperty } from '@/types/backend';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    pricePerNight: '',
  });

  // Ảnh: Có 2 loại
  // 1. oldImages: Ảnh URL đang có trên server
  // 2. newFiles: Ảnh dạng File mới chọn từ máy tính
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // 1. Tải dữ liệu cũ khi vào trang
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const id = params.id;
        const data = await apiGet<IProperty>(`/properties/${id}`);
        
        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            address: data.address,
            pricePerNight: String(data.pricePerNight),
          });
          // Lưu ảnh cũ để hiển thị
          if (data.images && Array.isArray(data.images)) {
            setOldImages(data.images);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Không tìm thấy thông tin chỗ nghỉ');
        router.push('/my-properties');
      } finally {
        setFetching(false);
      }
    };

    if (isLoggedIn) {
      fetchPropertyData();
    }
  }, [params.id, isLoggedIn, router]);

  // 2. Xử lý chọn ảnh mới
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Kiểm tra tổng số ảnh (Cũ + Mới) không quá 10 (cho thoải mái hơn lúc tạo)
      if (oldImages.length + newFiles.length + filesArray.length > 10) {
        toast.error('Tổng số ảnh không được vượt quá 10');
        return;
      }

      setNewFiles((prev) => [...prev, ...filesArray]);
      
      // Tạo preview cho ảnh mới
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previews]);
    }
  };

  // 3. Xóa ảnh MỚI chọn (chưa upload)
  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. Xóa ảnh CŨ (đã có trên server)
  // Lưu ý: Logic này tùy thuộc Backend. 
  // Cách đơn giản nhất: Frontend cứ xóa khỏi UI, Backend sẽ nhận list ảnh mới đè lên list cũ.
  const removeOldImage = (index: number) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 5. Submit Form Cập Nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('pricePerNight', formData.pricePerNight);

      // Gửi kèm danh sách ảnh cũ (để Backend biết giữ lại ảnh nào)
      // Backend cần xử lý: Nếu nhận được 'oldImages', giữ lại chúng.
      oldImages.forEach((img) => {
         data.append('oldImages', img); 
      });

      // Gửi kèm file ảnh mới
      newFiles.forEach((file) => {
        data.append('images', file); 
      });

      // Gọi API PATCH
      await apiPatch(`/properties/${params.id}`, data);

      toast.success('Cập nhật thành công!');
      router.push('/my-properties'); 
      
    } catch (error: unknown) {
      console.error(error);
      let msg = 'Lỗi khi cập nhật.';
      if (error instanceof AxiosError) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa chỗ nghỉ</h1>
            <p className="text-gray-500 text-sm">Cập nhật thông tin để thu hút khách hàng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Thông tin cơ bản */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Home size={18} className="text-blue-500" /> Tên chỗ nghỉ
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-red-500" /> Địa chỉ
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-600" /> Giá mỗi đêm (VND)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-gray-500" /> Mô tả chi tiết
              </label>
              <textarea
                required
                rows={5}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Quản lý Hình ảnh */}
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Hình ảnh</h2>
                <span className="text-sm text-gray-500">Tổng cộng: {oldImages.length + newFiles.length} ảnh</span>
             </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              
              {/* 1. Hiển thị ảnh CŨ */}
              {oldImages.map((url, index) => (
                <div key={`old-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 group shadow-sm ring-2 ring-blue-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Old" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">Hiện có</div>
                  
                  <button
                    type="button"
                    onClick={() => removeOldImage(index)}
                    className="absolute top-1 right-1 bg-white hover:bg-red-500 hover:text-white text-gray-600 rounded-full p-1.5 transition-all shadow-sm"
                    title="Xóa ảnh này"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* 2. Hiển thị ảnh MỚI */}
              {newPreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-green-200 group shadow-sm ring-2 ring-green-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="New" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">Mới</div>
                  
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-white hover:bg-red-500 hover:text-white text-gray-600 rounded-full p-1.5 transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Nút Upload */}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition text-gray-400 hover:text-blue-500 group">
                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-blue-100 transition">
                  <Upload size={24} />
                </div>
                <span className="text-xs mt-2 font-semibold">Thêm ảnh</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 shadow-lg flex items-center gap-2
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Đang lưu...' : (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}