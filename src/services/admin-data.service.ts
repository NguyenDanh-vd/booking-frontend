import { apiGet } from '@/utils/api';
import { IBooking, IProperty, IPayment, INotification, IReport } from '@/types/backend';

export const adminDataService = {
    async getBookings() {
        return apiGet<IBooking[]>(`/bookings/admin`);
    },
    async getProperties() {
        return apiGet<IProperty[]>(`/properties/admin`);
    },
    async getPayments() {
        return apiGet<IPayment[]>(`/payments/admin`);
    },
    async getNotifications() {
        return apiGet<INotification[]>(`/notifications/admin`);
    },
    async getReports() {
    return apiGet<IReport[]>(`/reports/admin`);
    },
};
