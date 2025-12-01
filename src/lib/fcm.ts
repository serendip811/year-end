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
                        // notification 페이로드: Android/iOS 자동 표시
                        notification: {
                            title,
                            body,
                        },
                        // data 페이로드: 커스텀 데이터 전달
                        data: {
                            title,
                            body,
                            ...(data || {}),
                        },
                        // Android 설정
                        android: {
                            priority: 'high',
                            notification: {
                                sound: 'default',
                                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                            },
                        },
                        // Web 설정
                        webpush: {
                            headers: {
                                Urgency: 'high',
                            },
                            notification: {
                                icon: '/icons/icon-192.png',
                                badge: '/icons/icon-192.png',
                            },
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('FCM HTTP v1 API error:', error);
            throw new Error(`FCM error: ${error}`);
        }

        const result = await response.json();
        console.log('Push notification sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to send push notification:', error);
        throw error;
    }
}
