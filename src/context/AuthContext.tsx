'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/utils/api';

// 1. Định nghĩa Interface User (Khớp với dữ liệu Backend trả về)
export interface IUser {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'GUEST' | 'HOST' | 'ADMIN';
  phone?: string;
}

// 2. Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
  isLoggedIn: boolean;
  user: IUser | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>; // Hàm để reload lại thông tin user (dùng sau khi update profile)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. Hàm Logout
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setUser(null);
    // Có thể thêm router.push('/login') tại đây nếu muốn redirect ngay
  }, []);

  // 4. Hàm lấy thông tin User (Fetch Profile)
  const fetchUserProfile = useCallback(async () => {
    try {
      // 👇 QUAN TRỌNG: Gọi đúng endpoint '/users/profile' như Backend Controller
      const data = await apiGet<IUser>('/users/profile');

      if (data) {
        setUser(data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      // Nếu lỗi (ví dụ token hết hạn 401), thực hiện logout để dọn dẹp
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // 5. Khởi tạo (Check token khi F5 trang)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  // 6. Hàm Login
  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsLoggedIn(true);
    fetchUserProfile(); // Gọi ngay để lấy thông tin chi tiết (avatar, full name...)
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      login,
      logout,
      loading,
      refreshUser: fetchUserProfile // Xuất hàm này ra để các trang khác (như Edit Profile) gọi cập nhật
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để sử dụng Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};