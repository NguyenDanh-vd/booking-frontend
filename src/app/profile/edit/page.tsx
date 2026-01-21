'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiGet, apiPatch } from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Camera, User, Phone, Save, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

interface IUserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  // 👇 Lấy hàm refreshUser từ Context
  const { user, isLoggedIn, refreshUser } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // 1. Load dữ liệu ban đầu
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setFetching(true);
        // Gọi API lấy thông tin chi tiết để điền vào form
        const res = await apiGet<IUserProfile>('/users/profile');
        
        if (res) {
          setFormData({
            fullName: res.fullName || '',
            phone: res.phone || '',
          });
          setPreviewAvatar(res.avatar || null);
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải thông tin hồ sơ');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, router]);

  // 2. Xử lý chọn ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Kiểm tra dung lượng < 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB');
        return;
      }
      
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // 3. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('phone', formData.phone);
      
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      // Gọi API Update
      await apiPatch('/users/profile', data);

      toast.success('Cập nhật hồ sơ thành công!');
      
      // 👇 QUAN TRỌNG: Gọi hàm này để Header cập nhật lại Avatar/Tên ngay lập tức
      if (refreshUser) {
        await refreshUser();
      }

      // Chuyển hướng mượt mà về trang Profile
      router.push('/profile'); 

    } catch (error: unknown) {
      console.error(error);
      let msg = 'Lỗi cập nhật hồ sơ';
      if (error instanceof AxiosError) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-4 text-white shadow-md">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-white/20 rounded-full transition backdrop-blur-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa hồ sơ</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative ring-4 ring-blue-50">
                {previewAvatar ? (
                  <Image 
                    src={previewAvatar} 
                    alt="Avatar Preview" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white" size={32} />
                </div>
              </div>

              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleAvatarChange}
                title="Thay đổi ảnh đại diện"
              />
              
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-md z-20 pointer-events-none">
                <Camera size={16} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3 font-medium">Chạm vào ảnh để thay đổi</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Email (Read only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide">Email (Không thể đổi)</label>
              <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed select-none">
                <Mail size={18} />
                <span className="font-medium">{user?.email || 'Đang tải...'}</span>
              </div>
            </div>

            {/* Họ tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase ml-1 tracking-wide">Họ và tên</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Nhập họ tên hiển thị"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase ml-1 tracking-wide">Số điện thoại</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Nhập số điện thoại liên hệ"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Đang lưu...
                </>
              ) : (
                <>
                  <Save size={20} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}