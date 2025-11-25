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

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, manitto_to, manitto_from')
            .eq('id', userPayload.id)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch details of the target (manitto_to)
        let targetUser = null;
        if (user.manitto_to) {
            const { data: target } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .eq('id', user.manitto_to)
                .single();
            targetUser = target;
        }

        // Fetch details of the manitto (manitto_from) - but keep name secret if needed?
        // Actually, for the room ID we just need the ID.
        // The UI might want to show "Secret Friend" instead of name.

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
            },
            target: targetUser, // { id, name }
            manittoId: user.manitto_from, // Just ID, keep name secret
        });
    } catch (error) {
        console.error('Relationship fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
