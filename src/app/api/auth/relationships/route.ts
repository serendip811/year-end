import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const userPayload = await getUserFromCookie();
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, manitto_to, manitto_from')
            .eq('id', userPayload.id)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch target user in parallel if manitto_to exists
        let targetUser = null;
        if (user.manitto_to) {
            const { data: target } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .eq('id', user.manitto_to)
                .single();
            targetUser = target;
        }

        // Return response with caching headers
        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                },
                target: targetUser, // { id, name } or null
                manittoId: user.manitto_from, // Just ID, keep name secret
            },
            {
                headers: {
                    'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
                },
            }
        );
    } catch (error) {
        console.error('Relationship fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
