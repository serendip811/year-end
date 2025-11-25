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

        // RPC 호출 - 단 1번 요청으로 모든 정보 가져옴
        const { data, error } = await supabaseAdmin.rpc(
            'get_user_relationship',
            { uid: userPayload.id }
        );

        if (error || !data || data.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const row = data[0]; // RPC는 배열 형태 반환

        return NextResponse.json(
            {
                user: {
                    id: row.user_id,
                    name: row.user_name,
                },
                target: row.target_id
                    ? { id: row.target_id, name: row.target_name }
                    : null,
                manittoId: row.manitto_from,
            },
            {
                headers: {
                    'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
                },
            }
        );

    } catch (error) {
        console.error('Relationship fetch error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}