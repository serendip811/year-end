import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, startDate, endDate } = body;

        // Check admin password
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Get bidirectional message stats
        const { data: statsData, error: statsError } = await supabaseAdmin.rpc(
            'get_admin_bidirectional_message_stats',
            {
                start_date: startDate || null,
                end_date: endDate || null,
            }
        );

        if (statsError) {
            console.error('Error fetching admin stats:', statsError);
            return NextResponse.json(
                { error: 'Failed to fetch stats' },
                { status: 500 }
            );
        }

        // Get bidirectional summary
        const { data: summaryData, error: summaryError } = await supabaseAdmin.rpc(
            'get_admin_bidirectional_summary',
            {
                start_date: startDate || null,
                end_date: endDate || null,
            }
        );

        if (summaryError) {
            console.error('Error fetching relationship summary:', summaryError);
            return NextResponse.json(
                { error: 'Failed to fetch summary' },
                { status: 500 }
            );
        }

        // Transform data for easier frontend consumption
        const relationships = summaryData || [];
        const stats = statsData || [];

        // Group stats by relationship
        const statsMap = new Map();
        
        relationships.forEach((rel: any) => {
            const key = `${rel.user_a_id}-${rel.user_b_id}`;
            statsMap.set(key, {
                userAName: rel.user_a_name,
                userBName: rel.user_b_name,
                aToBTotal: rel.a_to_b_total,
                bToATotal: rel.b_to_a_total,
                totalMessages: rel.total_messages,
                dailyStats: [],
            });
        });

        stats.forEach((stat: any) => {
            const key = `${stat.user_a_id}-${stat.user_b_id}`;
            if (statsMap.has(key)) {
                const rel = statsMap.get(key);
                rel.dailyStats.push({
                    date: stat.message_date,
                    aToBCount: parseInt(stat.a_to_b_count),
                    bToACount: parseInt(stat.b_to_a_count),
                });
            }
        });

        return NextResponse.json({
            relationships: Array.from(statsMap.values()),
        });
    } catch (error) {
        console.error('Error in admin stats API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

