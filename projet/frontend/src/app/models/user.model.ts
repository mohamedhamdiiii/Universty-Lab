export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  phone?: string;
  department?: string;
  createdAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
