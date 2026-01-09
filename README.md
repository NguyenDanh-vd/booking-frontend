# 🎨 Booking App – Client Side

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

> Giao diện người dùng hiện đại cho ứng dụng đặt phòng Homestay, được xây dựng bằng **Next.js 14 (App Router)** nhằm tối ưu hiệu năng và trải nghiệm người dùng.

---

## 🌟 Tính Năng Chính

### 🔐 Xác thực & Người dùng
- ✅ Đăng ký / Đăng nhập với JWT
- ✅ Lưu trữ Token an toàn
- ✅ Tự động đính kèm Token vào API request
- ✅ Tự động Logout khi Token hết hạn
- ✅ Quản lý trạng thái đăng nhập bằng **AuthContext**

### 🏠 Chức năng chính
- ✅ Trang chủ hiển thị danh sách phòng dạng Grid
- ✅ Đăng tin cho thuê với form nhập liệu chi tiết
- ✅ Xem trước ảnh (Preview) trước khi upload
- ✅ Upload nhiều ảnh (Multipart/form-data)
- ✅ Responsive cho Mobile / Tablet / Desktop

### ⚡ Trải nghiệm UI/UX
- ✅ Toast Notification với `react-hot-toast`
- ✅ Loading State (Skeleton / Spinner)
- ✅ Tối ưu hình ảnh với `next/image`

---

## 🛠️ Công Nghệ Sử Dụng

| Hạng mục | Công nghệ |
|--------|----------|
| Framework | Next.js 14 (App Router) |
| Ngôn ngữ | TypeScript |
| Styling | Tailwind CSS, CLSX |
| HTTP Client | Axios (Custom Interceptors) |
| Icons | Lucide React |
| Thông báo | React Hot Toast |
| State Management | React Context API & Hooks |

---

## 🚀 Hướng Dẫn Cài Đặt

### 1️⃣ Yêu cầu
- Node.js **v18+**
- Backend **NestJS** đang chạy (mặc định `http://localhost:3000`)

### 2️⃣ Cài đặt dependencies
```bash
npm install
