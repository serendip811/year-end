import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password } = body;

        // Check admin password
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Get total message count
        const { count: totalCount, error: countError } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true });

        // Get all messages
        const { data: allMessages, error: allMsgError } = await supabaseAdmin
            .from('messages')
            .select(`
                sender,
                receiver,
                created_at,
                sender_user:sender(name),
                receiver_user:receiver(name)
            `)
            .order('created_at', { ascending: true });

        // Get all users with relationships
        const { data: allUsers, error: usersError } = await supabaseAdmin
            .from('users')
            .select(`
                name,
                manitto_to_user:manitto_to(name),
                manitto_from_user:manitto_from(name)
            `)
            .order('name');

        return NextResponse.json({
            totalMessages: totalCount,
            allMessages: allMessages,
            allUsers: allUsers,
            errors: {
                countError,
                allMsgError,
                usersError,
            },
        });
    } catch (error) {
        console.error('Error in debug API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

