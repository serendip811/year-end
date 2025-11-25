import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { comparePassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET(request: Request) {
    return NextResponse.json({ error: 'Method not allowed. Please use POST.' }, { status: 405 });
}

export async function POST(request: Request) {
    try {
        const { name, password } = await request.json();

        if (!name || !password) {
            return NextResponse.json({ error: 'Name and password are required' }, { status: 400 });
        }

        // Find user by name
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('name', name)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check password (compare with hash)
        // Note: In a real scenario, we should check if password_hash exists.
        // If it's the first login, we might be checking against initial_password if we didn't hash it yet?
        // The spec says "initial_password text not null, password_hash text not null".
        // It implies we should check password_hash.
        // However, if the user hasn't changed it, maybe the initial_password IS the password?
        // Let's assume the admin sets up the user with a hashed password in password_hash initially,
        // OR we check both?
        // The spec says: "Logins use admin-assigned initial password... User can change it."
        // Let's assume we check against `password_hash`.

        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = await signToken({ id: user.id, name: user.name });

        // Check if the password used matches the initial_password (stored in plain text per schema)
        // If so, prompt for change.
        const mustChangePassword = password === user.initial_password;

        const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name }, mustChangePassword });

        // Set cookie in response
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

