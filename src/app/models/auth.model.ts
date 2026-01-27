import { User } from './user.model';

export interface AuthResponse {
    token: string;
    expiresAt: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
}
