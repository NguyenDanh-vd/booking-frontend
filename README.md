# 🎨 Booking App - Client Side

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

> Giao diện người dùng hiện đại cho ứng dụng đặt phòng Homestay, được xây dựng bằng **Next.js 14 (App Router)** tối ưu hóa hiệu năng và trải nghiệm người dùng.

## 🌟 Tính Năng Chính

### 🔐 Xác thực & Người dùng
- [x] **Đăng ký / Đăng nhập**: Tích hợp JWT, lưu trữ Token an toàn.
- [x] **Quản lý phiên đăng nhập**: Tự động đính kèm Token vào API, tự động Logout khi hết hạn.
- [x] **Context API**: Quản lý trạng thái đăng nhập toàn cục (`AuthContext`).

### 🏠 Chức năng chính
- [x] **Trang chủ**: Hiển thị danh sách phòng với giao diện Grid đẹp mắt.
- [x] **Đăng tin cho thuê**: Form nhập liệu chi tiết, **xem trước ảnh (Preview)** trước khi upload.
- [x] **Upload ảnh**: Hỗ trợ upload nhiều ảnh cùng lúc (Multipart/form-data).
- [x] **Responsive**: Giao diện tương thích hoàn hảo trên Mobile, Tablet và Desktop.

### ⚡ Trải nghiệm UI/UX
- [x] **Toast Notifications**: Thông báo trạng thái (Thành công/Lỗi) đẹp mắt với `react-hot-toast`.
- [x] **Loading States**: Hiệu ứng Skeleton hoặc Spinner khi đang tải dữ liệu.
- [x] **Optimized Images**: Sử dụng `next/image` để tối ưu hóa tốc độ tải ảnh.

---

## 🛠️ Công Nghệ Sử Dụng

| Hạng mục | Công nghệ / Thư viện |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Ngôn ngữ** | TypeScript |
| **Styling** | Tailwind CSS, CLSX |
| **HTTP Client** | Axios (Custom Interceptors) |
| **Icons** | Lucide React |
| **Thông báo** | React Hot Toast |
| **Quản lý State** | React Context API & Hooks |

---

## 🚀 Hướng Dẫn Cài Đặt

Làm theo các bước sau để chạy dự án trên máy local:

### 1. Yêu cầu (Prerequisites)
- Node.js (v18 trở lên)
- Backend NestJS đang chạy (Mặc định port 3000)

### 2. Cài đặt dependencies
```bash
npm install