import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: number; username: string; is_admin: boolean }): string {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            isAdmin: user.is_admin,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function verifyToken(token: string): { userId: number; username: string; isAdmin: boolean } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: number;
            username: string;
            isAdmin: boolean;
        };
        return decoded;
    } catch (error) {
        return null;
    }
}

export function getTokenFromRequest(request: Request): string | null {
    // Try to get from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Try to get from cookie
    const cookies = request.headers.get('cookie');
    if (cookies) {
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
        if (tokenCookie) {
            return tokenCookie.split('=')[1];
        }
    }

    return null;
}

export function getCurrentUser(request: Request): { userId: number; username: string; isAdmin: boolean } | null {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}

export function requireAuth(request: Request): { userId: number; username: string; isAdmin: boolean } {
    const user = getCurrentUser(request);
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export function requireAdmin(request: Request): { userId: number; username: string; isAdmin: boolean } {
    const user = requireAuth(request);
    if (!user.isAdmin) {
        throw new Error('Forbidden: Admin access required');
    }
    return user;
}
