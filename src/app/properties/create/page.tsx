'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, X, DollarSign, MapPin, Home, FileText } from 'lucide-react';
import { AxiosError } from 'axios'; // 1. Import AxiosError

export default function CreatePropertyPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    pricePerNight: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (selectedFiles.length + filesArray.length > 5) {
        toast.error('Chỉ được đăng tối đa 5 ảnh');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để đăng tin');
      router.push('/login');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh minh họa');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('pricePerNight', formData.pricePerNight);

      selectedFiles.forEach((file) => {
        data.append('images', file); 
      });

      await apiPost('/properties', data);

      toast.success('Đăng tin thành công!');
      router.push('/'); 
      
    } catch (error: unknown) { 
      // 2. SỬA LỖI TẠI ĐÂY: Dùng unknown thay vì any
      console.error(error);
      
      let msg = 'Lỗi khi đăng tin. Vui lòng thử lại.';

      // Kiểm tra nếu lỗi từ Axios thì lấy message từ Backend
      if (error instanceof AxiosError) {
        const backendMsg = error.response?.data?.message;
        // Backend có thể trả về mảng (lỗi validation) hoặc chuỗi
        msg = Array.isArray(backendMsg) ? backendMsg[0] : (backendMsg || msg);
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Đăng chỗ ở mới</h1>
          <p className="text-blue-100 text-lg opacity-90">Chia sẻ không gian tuyệt vời của bạn tới hàng triệu du khách</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Home size={18} className="text-blue-500" /> Tên chỗ nghỉ
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Villa Đà Lạt view đồi thông săn mây..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-red-500" /> Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, đường, phường, thành phố..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
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
                  placeholder="Nhập giá tiền..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
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
                placeholder="Mô tả về tiện nghi, không gian, những điều đặc biệt..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition shadow-sm"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Hình ảnh</h2>
                <span className="text-sm text-gray-500">Đã chọn: {selectedFiles.length}/5</span>
             </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previewUrls.length < 5 && (
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
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </span>
              ) : 'Đăng tin ngay'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-4">
              Bằng việc đăng tin, bạn đồng ý với các điều khoản dịch vụ của BookingApp.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}