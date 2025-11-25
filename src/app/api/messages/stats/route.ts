import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
    try {
        // Verify JWT from cookie
        const payload = await getUserFromCookie();
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = payload.id as string;

        // Call Supabase function to get stats
        const { data, error } = await supabaseAdmin.rpc('get_user_message_stats', {
            uid: userId
        });

        if (error) {
            console.error('Error fetching message stats:', error);
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching message stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
