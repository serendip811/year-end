import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
    try {
        const payload = await getUserFromCookie();
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('room_id');
        const before = searchParams.get('before');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!roomId) {
            return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
        }

        let query = supabaseAdmin
            .from('messages')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error in messages list:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
