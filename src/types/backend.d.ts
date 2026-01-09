export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'GUEST' | 'HOST' | 'ADMIN';
}

export interface IProperty {
  id: number;
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  images: string[];
  owner?: {
    fullName: string;
    avatar?: string;
  };
}

export interface IBooking {
  id: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  property: IProperty;
}