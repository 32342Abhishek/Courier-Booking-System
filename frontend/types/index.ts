// API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected';
export type ShipmentStatus = 'Approved' | 'In Transit' | 'Delivered';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface Booking {
  _id: string;
  bookingId: string;
  customer: User | string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: 'Document' | 'Parcel' | 'Fragile' | 'Heavy';
  packageWeight: number;
  packageImage?: string;
  calculatedPrice?: number;
  status: BookingStatus;
  shipment?: Shipment | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  status: ShipmentStatus;
  timestamp: string;
  note?: string;
}

export interface Shipment {
  _id: string;
  trackingNumber: string;
  booking: Booking | string;
  status: ShipmentStatus;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  count?: number;
}
