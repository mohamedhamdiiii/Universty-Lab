// Equipment model - matches the backend Equipment table
export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  status: 'available' | 'in_use' | 'maintenance';
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
}
