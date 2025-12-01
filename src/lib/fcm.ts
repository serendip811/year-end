import { google } from 'googleapis';

/**
 * Get OAuth2 access token for FCM HTTP v1 API
 */
async function getAccessToken(): Promise<string> {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}'
    );

    const jwtClient = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const tokens = await jwtClient.authorize();
    return tokens.access_token || '';
}

/**
 * Send push notification using FCM HTTP v1 API
 */
export async function sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
) {
    try {
        const accessToken = await getAccessToken();
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        const response = await fetch(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    message: {
                        token: fcmToken,
                        // data 페이로드만 사용: Service Worker와 앱에서 직접 처리
                        data: {
                            title,
                            body,
                            ...(data || {}),
                        },
                        // Android 설정
                        android: {
                            priority: 'high',
                        },
                        // Web 설정
                        webpush: {
                            headers: {
                                Urgency: 'high',
                            },
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[FCM] HTTP v1 API error:', {
                status: response.status,
                statusText: response.statusText,
                error: error
            });
            throw new Error(`FCM error: ${response.status} - ${error}`);
        }

        const result = await response.json();
        console.log('[FCM] Push notification sent successfully:', {
            messageId: result.name,
            token: fcmToken.substring(0, 20) + '...',
        });
        return result;
    } catch (error: any) {
        console.error('[FCM] Failed to send push notification:', {
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
}
