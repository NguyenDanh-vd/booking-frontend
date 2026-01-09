import axios from 'axios';

// 1. Tạo instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây không phản hồi thì hủy
});

// 2. Interceptor cho REQUEST (Gửi đi)
// Tự động đính kèm Token vào Header nếu đã đăng nhập
axiosInstance.interceptors.request.use(
  (config) => {
    // Chỉ chạy ở phía Client (Trình duyệt)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor cho RESPONSE (Nhận về)
// Giúp xử lý lỗi gọn gàng hơn
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;

    // Trường hợp API trả dạng phân trang { data, total, page, lastPage }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    // Trường hợp API trả thẳng object hoặc array
    return data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: xử lý logout
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;