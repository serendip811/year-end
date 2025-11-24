import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secretKey);
}

export async function verifyToken(token: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}

export function setAuthCookie(token: string) {
    cookies().set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export function clearAuthCookie() {
    cookies().delete('auth_token');
}

export function getAuthToken() {
    return cookies().get('auth_token')?.value;
}

export async function getUserFromCookie() {
    const token = getAuthToken();
    if (!token) return null;
    return await verifyToken(token);
}
