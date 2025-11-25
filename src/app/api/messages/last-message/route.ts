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
        const roomIds = searchParams.get('room_ids')?.split(',') || [];

        if (roomIds.length === 0) {
            return NextResponse.json({}, { status: 200 });
        }

        const lastMessages: { [key: string]: string } = {};

        for (const roomId of roomIds) {
            const { data: messages } = await supabaseAdmin
                .from('messages')
                .select('created_at')
                .eq('room_id', roomId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (messages && messages.length > 0) {
                lastMessages[roomId] = messages[0].created_at;
            }
        }

        return NextResponse.json(lastMessages);
    } catch (error) {
        console.error('Error fetching last messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
