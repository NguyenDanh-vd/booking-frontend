import { apiGet } from '@/utils/api';

// Định nghĩa kiểu dữ liệu trả về cho dashboard stats
export interface AdminDashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalProperties: number;
    totalRevenue: number;
}

export const adminStatsService = {
    async getDashboardStats(): Promise<AdminDashboardStats> {
        return apiGet<AdminDashboardStats>(`/admin/dashboard/stats`);
    },
};
