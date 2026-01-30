import Link from "next/link";
import { ReactNode } from "react";

const adminMenu = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Người dùng" },
    { href: "/admin/bookings", label: "Booking" },
    { href: "/admin/properties", label: "Chỗ nghỉ" },
    { href: "/admin/payments", label: "Thanh toán" },
    { href: "/admin/notifications", label: "Thông báo" },
    { href: "/admin/reports", label: "Báo cáo" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <aside className="w-56 bg-white border-r shadow-sm hidden md:block">
                <div className="p-6 font-bold text-xl text-blue-700 border-b">Admin Panel</div>
                <nav className="flex flex-col gap-1 p-4">
                    {adminMenu.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium transition"
                            prefetch={false}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 min-h-screen">{children}</main>
        </div>
    );
}
