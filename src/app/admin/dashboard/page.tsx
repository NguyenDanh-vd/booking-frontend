"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/utils/api";
import { adminDataService } from "@/services/admin-data.service";

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [usersCount, setUsersCount] = useState(0);
    const [bookingsCount, setBookingsCount] = useState(0);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchStats = async () => {
        try {
            setLoading(true);

            const users = await apiGet<any[]>("/users/admin/users");
            const bookings = await adminDataService.getBookings();
            const properties = await adminDataService.getProperties();
            const payments = await adminDataService.getPayments();

            setUsersCount(Array.isArray(users) ? users.length : 0);
            setBookingsCount(Array.isArray(bookings) ? bookings.length : 0);
            setPropertiesCount(Array.isArray(properties) ? properties.length : 0);

            const revenue = Array.isArray(payments) ? payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) : 0;
            setTotalRevenue(revenue);
        } catch (err) {
            console.error('Error fetching admin stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="max-w-5xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Bảng điều khiển quản trị</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl shadow p-6 border border-blue-200 flex flex-col gap-2">
                    <span className="font-bold text-lg text-blue-700">Tổng số người dùng</span>
                    <span className="text-3xl font-mono text-blue-600">{loading ? '...' : usersCount}</span>
                </div>
                <div className="bg-green-50 rounded-xl shadow p-6 border border-green-200 flex flex-col gap-2">
                    <span className="font-bold text-lg text-green-700">Tổng số booking</span>
                    <span className="text-3xl font-mono text-green-600">{loading ? '...' : bookingsCount}</span>
                </div>
                <div className="bg-orange-50 rounded-xl shadow p-6 border border-orange-200 flex flex-col gap-2">
                    <span className="font-bold text-lg text-orange-700">Tổng số chỗ nghỉ</span>
                    <span className="text-3xl font-mono text-orange-600">{loading ? '...' : propertiesCount}</span>
                </div>
                <div className="bg-purple-50 rounded-xl shadow p-6 border border-purple-200 flex flex-col gap-2">
                    <span className="font-bold text-lg text-purple-700">Tổng doanh thu</span>
                    <span className="text-3xl font-mono text-purple-600">
                        {loading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                    </span>
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
