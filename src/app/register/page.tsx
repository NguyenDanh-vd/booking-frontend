'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/auth/register', formData);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch {
      toast.error('Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-extrabold">BookingApp</h1>
          <p className="mt-2 opacity-90">Tạo tài khoản để bắt đầu</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                required
                placeholder="0912xxxxxx"
                className="w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Ít nhất 6 ký tự"
                className="w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* Button */}
            <button
               type="submit"
               disabled={loading}
               className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-200 ${
                 loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] shadow-lg'
                }`}
                >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            
          </form>
          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-purple-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
