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
                        // Use data-only message to handle both foreground and background
                        data: {
                            title,
                            body,
                            ...(data || {}),
                        },
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
