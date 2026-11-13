// Equipment model - matches backend Equipment table
export interface Equipment {
  id?: number;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  status?: 'available' | 'in_use' | 'maintenance';
  available?: boolean;
  image?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
