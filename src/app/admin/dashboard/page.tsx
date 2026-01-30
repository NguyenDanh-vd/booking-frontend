"use client";

export default function AdminDashboardPage() {
    return (
        <div className="max-w-5xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Bảng điều khiển quản trị</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-2">
                    <span className="font-bold text-lg">Tổng số người dùng</span>
                    <span className="text-3xl font-mono">...</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-2">
                    <span className="font-bold text-lg">Tổng số booking</span>
                    <span className="text-3xl font-mono">...</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-2">
                    <span className="font-bold text-lg">Tổng số chỗ nghỉ</span>
                    <span className="text-3xl font-mono">...</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-2">
                    <span className="font-bold text-lg">Tổng doanh thu</span>
                    <span className="text-3xl font-mono">...</span>
                </div>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/admin/users" className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-center hover:bg-blue-100 transition">
                    <span className="font-bold text-blue-700">Quản lý người dùng</span>
                </a>
                <a href="/admin/bookings" className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center hover:bg-green-100 transition">
                    <span className="font-bold text-green-700">Quản lý booking</span>
                </a>
                <a href="/admin/properties" className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col items-center hover:bg-orange-100 transition">
                    <span className="font-bold text-orange-700">Quản lý chỗ nghỉ</span>
                </a>
                <a href="/admin/payments" className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex flex-col items-center hover:bg-purple-100 transition">
                    <span className="font-bold text-purple-700">Quản lý thanh toán</span>
                </a>
                <a href="/admin/send-notification" className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex flex-col items-center hover:bg-yellow-100 transition">
                    <span className="font-bold text-yellow-700">Gửi thông báo</span>
                </a>
                <a href="/admin/reports" className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center hover:bg-red-100 transition">
                    <span className="font-bold text-red-700">Báo cáo & khiếu nại</span>
                </a>
            </div>
        </div>
    );
}
