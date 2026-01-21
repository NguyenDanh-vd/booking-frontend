'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Plane, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

interface LoginResponse {
  access_token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = (await axiosInstance.post('/auth/login', {
        email,
        password,
      })) as LoginResponse;

      if (res.access_token) {
        login(res.access_token);
        toast.success('Đăng nhập thành công');
        router.push('/');
      }
    } catch {
      toast.error('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-blue-900/70 to-purple-900/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <Plane size={24} className="-rotate-45" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BookingApp</h1>
          <p className="text-gray-500 text-sm mt-2">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Form */}
        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-bold text-gray-600 uppercase">
                Email
              </label>
              <div className="relative group">
                <Mail
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                             text-sm focus:bg-white focus:border-blue-500 focus:ring-4
                             focus:ring-blue-500/10 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <div className="relative group">
                <Lock
                  size={20}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                             text-sm focus:bg-white focus:border-blue-500 focus:ring-4
                             focus:ring-blue-500/10 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`group w-full flex items-center justify-center py-3.5 rounded-xl
                text-white font-bold text-sm shadow-lg transition-all
                ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-blue-500/30'
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Đăng nhập
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition"
                  />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="font-bold text-blue-600 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 text-white/40 text-xs">
        © 2026 BookingApp. All rights reserved.
      </div>
    </div>
  );
}
