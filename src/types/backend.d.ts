// 1. USER
export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;           // Tiểu sử
  isVerified?: boolean;   // Xác thực email
  role: 'GUEST' | 'HOST' | 'ADMIN';
}

// 6. REPORT (Báo cáo & Khiếu nại)
export interface IReport {
  id: number;
  type: 'REPORT' | 'COMPLAINT' | 'VIOLATION';
  content?: string;
  message?: string;
  senderId?: number;
  sender?: IUser;
  createdAt?: string;
}

// 2. PROPERTY (Căn hộ)
export interface IProperty {
  id: number;
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  images: string[];

  // [Mới] Thông tin chi tiết căn hộ
  maxGuests: number;      // Quan trọng để validate số khách
  numBedrooms?: number;
  numBeds?: number;
  numBathrooms?: number;
  cleaningFee?: number;   // [Mới] Phí dọn dẹp (Dùng để tính tổng tiền)

  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

  owner?: IUser;          // Thông tin chủ nhà
  ownerId?: number;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// 3. BOOKING (Đặt phòng)
export interface IBooking {
  id: number;
  checkIn: string;        // Dạng ISO String
  checkOut: string;

  guestCount: number;     // [Mới] Số lượng khách

  // [Mới] Breakdown chi phí (Snapshot giá lúc đặt)
  nightlyPrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;

  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';

  propertyId: number;
  guestId: number;

  property: IProperty;    // Relation: Chi tiết phòng
  guest?: IUser;          // Relation: Người đặt (Dành cho Host xem)
  payment?: IPayment;     // Relation: Thông tin thanh toán

  createdAt: string;
  hasReviewed: boolean; // Đánh giá đã được viết hay chưa
}

// 4. PAYMENT (Thanh toán) - [Mới]
export interface IPayment {
  id: number;
  amount: number;
  provider: string;       // VNPAY, STRIPE...
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionCode?: string;
  bookingId: number;
  paymentDate: string;

  // Relations
  booking?: IBooking;     // Include khi cần thông tin booking
}

// 5. NOTIFICATION (Thông báo) - [Mới]
export interface INotification {
  id: number;
  title: string;
  message: string;
  type: 'SYSTEM' | 'BOOKING' | 'PAYMENT';
  isRead: boolean;
  createdAt: string;
  senderId?: number;
  sender?: IUser; // Thông tin người gửi (cho Admin gửi thông báo)
  userId?: number;
  user?: IUser; // Thông tin người nhận (cho Admin xem)
}