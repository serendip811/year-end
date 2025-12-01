import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all tokens for this user
        const { error } = await supabaseAdmin
            .from('push_tokens')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Token deletion error:', error);
            return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
        }

        console.log(`[Push] Deleted tokens for user: ${user.id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete token error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

