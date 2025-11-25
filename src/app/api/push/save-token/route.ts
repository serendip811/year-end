import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

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

        // Delete existing tokens for this user (a user should only have one active token)
        const { error: deleteError } = await supabaseAdmin
            .from('push_tokens')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Token delete error:', deleteError);
        }

        // Insert new token
        const { error: insertError } = await supabaseAdmin
            .from('push_tokens')
            .insert({
                user_id: user.id,
                token: token,
                updated_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error('Token insert error:', insertError);
            return NextResponse.json({ error: 'Failed to save token', details: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save token error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
