import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromCookie } from '@/lib/jwt';
import { sendPushNotification } from '@/lib/fcm';

export const dynamic = 'force-dynamic';

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
            console.log('[Push] Starting push notification process...');

            // Get receiver's push token
            const { data: tokenData } = await supabaseAdmin
                .from('push_tokens')
                .select('token')
                .eq('user_id', receiverId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            console.log('[Push] Token lookup result:', tokenData ? 'Found' : 'Not found');

            if (tokenData?.token) {
                console.log('[Push] Sending notification:', {
                    receiver: receiverId,
                    tokenPrefix: tokenData.token.substring(0, 20) + '...',
                    title: '새 메시지',
                    body: '새로운 메시지가 도착했습니다',
                });

                // Send FCM push notification using HTTP v1 API
                const result = await sendPushNotification(
                    tokenData.token,
                    '새 메시지',
                    '새로운 메시지가 도착했습니다',
                    {
                        room_id: roomId,
                        sender_id: user.id,
                    }
                );

                console.log('[Push] Notification sent successfully:', result);
            } else {
                console.log('[Push] No push token found for receiver:', receiverId);
            }
        } catch (pushError: any) {
            // Don't fail the message send if push fails
            console.error('[Push] Push notification error:', pushError.message);
            console.error('[Push] Error stack:', pushError.stack);
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
