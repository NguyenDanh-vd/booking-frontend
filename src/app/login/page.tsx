'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

interface LoginResponse {
  access_token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', {
        email,
        password,
      }) as LoginResponse;

      if (res.access_token) {
        login(res.access_token);
        toast.success('Đăng nhập thành công');
        router.push('/');
      }
    } catch{
      toast.error('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
  bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">

      <div className="w-full max-w-md">
        
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            BookingApp
          </h1>
          <p className="text-white-500 mt-2">
            Đăng nhập để tiếp tục
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition
                "
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-xl border border-gray-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition
                "
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full h-12 rounded-xl font-semibold text-white
                transition-all duration-200
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg'
                }
              `}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
