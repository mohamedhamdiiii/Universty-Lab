import { User } from './user.model';

export interface Equipment {
  id?: number;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  available: boolean;
  quantity: number;
}

export interface Reservation {
  id?: number;
  userId: number;
  equipmentId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled';
  notes?: string;
  quantity: number;
  equipment?: Equipment;
  user?: User;
  createdAt?: string;
}
