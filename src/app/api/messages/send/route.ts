import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomId, content, receiverId } = await request.json();

        if (!roomId || !content || !receiverId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Insert message into DB
        const { data: message, error } = await supabaseAdmin
            .from('messages')
            .insert({
                room_id: roomId,
                sender: user.id,
                receiver: receiverId,
                content: content,
            })
            .select()
            .single();

        if (error) {
            console.error('Message insert error:', error);
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
        }

        // Trigger Push Notification (Fire and forget)
        // We'll implement the push logic here or call another function.
        // For now, let's just log it. The spec says "receiver's push_token lookup -> FCM push".

        // TODO: Implement Push Notification logic
        // await sendPushNotification(receiverId, content, roomId);

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
