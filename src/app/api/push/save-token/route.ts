import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Upsert token
        const { error } = await supabaseAdmin
            .from('push_tokens')
            .upsert({
                user_id: user.id,
                token: token,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'token' });

        if (error) {
            console.error('Token save error:', error);
            return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save token error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
