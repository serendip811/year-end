import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';
import { sendPushNotification } from '@/lib/fcm';

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

        // Send Push Notification
        try {
            // Get receiver's push token
            const { data: tokenData } = await supabaseAdmin
                .from('push_tokens')
                .select('token')
                .eq('user_id', receiverId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (tokenData?.token) {
                // Get sender's name
                const { data: senderData } = await supabaseAdmin
                    .from('users')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                const senderName = senderData?.name || '익명';
                const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;

                // Send FCM push notification using HTTP v1 API
                await sendPushNotification(
                    tokenData.token,
                    `${senderName}님의 메시지`,
                    messagePreview,
                    {
                        room_id: roomId,
                        sender_id: user.id,
                    }
                );
            } else {
                console.log('No push token found for receiver');
            }
        } catch (pushError) {
            // Don't fail the message send if push fails
            console.error('Push notification error:', pushError);
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
