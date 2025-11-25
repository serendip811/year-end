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

        // Get user relationships
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('manitto_from, manitto_to')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Initialize stats
        const stats = {
            manitto: { sent: 0, received: 0 },
            target: { sent: 0, received: 0 },
        };

        // Get stats for manitto (from_manitto)
        if (user.manitto_from) {
            const { data: manittoMessages } = await supabaseAdmin
                .from('messages')
                .select('sender')
                .or(`sender.eq.${userId},sender.eq.${user.manitto_from}`)
                .or(`receiver.eq.${userId},receiver.eq.${user.manitto_from}`);

            if (manittoMessages) {
                manittoMessages.forEach((msg) => {
                    if (msg.sender === userId) {
                        stats.manitto.sent++;
                    } else {
                        stats.manitto.received++;
                    }
                });
            }
        }

        // Get stats for target (to_target)
        if (user.manitto_to) {
            const { data: targetMessages } = await supabaseAdmin
                .from('messages')
                .select('sender')
                .or(`sender.eq.${userId},sender.eq.${user.manitto_to}`)
                .or(`receiver.eq.${userId},receiver.eq.${user.manitto_to}`);

            if (targetMessages) {
                targetMessages.forEach((msg) => {
                    if (msg.sender === userId) {
                        stats.target.sent++;
                    } else {
                        stats.target.received++;
                    }
                });
            }
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching message stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
