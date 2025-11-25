import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface DailyCount {
    date: string;
    manitto: number;
    target: number;
}

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

        // Helper to get KST date string (YYYY-MM-DD)
        const getKSTDateString = (date: Date | string) => {
            return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
        };

        // Initialize daily counts map
        const dailyCountsMap = new Map<string, { manitto: number; target: number }>();

        // Initialize all dates in the last 30 days with 0 counts (based on KST)
        const now = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = getKSTDateString(date);
            dailyCountsMap.set(dateStr, { manitto: 0, target: 0 });
        }

        // Get manitto messages
        if (user.manitto_from) {
            const { data: manittoMessages } = await supabaseAdmin
                .from('messages')
                .select('created_at')
                // Fetch a bit more than 30 days to cover timezone differences
                .gte('created_at', new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString())
                .or(`and(sender.eq.${userId},receiver.eq.${user.manitto_from}),and(sender.eq.${user.manitto_from},receiver.eq.${userId})`);

            if (manittoMessages) {
                manittoMessages.forEach((msg) => {
                    const dateStr = getKSTDateString(msg.created_at);
                    // Only count if it's within our map (last 30 days KST)
                    const counts = dailyCountsMap.get(dateStr);
                    if (counts) {
                        counts.manitto++;
                    }
                });
            }
        }

        // Get target messages
        if (user.manitto_to) {
            const { data: targetMessages } = await supabaseAdmin
                .from('messages')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString())
                .or(`and(sender.eq.${userId},receiver.eq.${user.manitto_to}),and(sender.eq.${user.manitto_to},receiver.eq.${userId})`);

            if (targetMessages) {
                targetMessages.forEach((msg) => {
                    const dateStr = getKSTDateString(msg.created_at);
                    const counts = dailyCountsMap.get(dateStr);
                    if (counts) {
                        counts.target++;
                    }
                });
            }
        }

        // Convert map to array and sort by date
        const dailyCounts: DailyCount[] = Array.from(dailyCountsMap.entries())
            .map(([date, counts]) => ({
                date,
                manitto: counts.manitto,
                target: counts.target,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(dailyCounts);
    } catch (error) {
        console.error('Error fetching daily message stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
