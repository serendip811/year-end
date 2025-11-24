'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';

export default function FCMDebugger() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    useEffect(() => {
        const testFCM = async () => {
            addLog('🔍 Starting FCM Debug...');

            // Check browser environment
            if (typeof window === 'undefined') {
                addLog('❌ Not in browser environment');
                return;
            }
            addLog('✅ Browser environment OK');

            // Check Notification API
            if (!('Notification' in window)) {
                addLog('❌ Notification API not supported');
                return;
            }
            addLog('✅ Notification API supported');

            // Check Service Worker
            if (!('serviceWorker' in navigator)) {
                addLog('❌ Service Worker not supported');
                return;
            }
            addLog('✅ Service Worker supported');

            // Check current permission
            addLog(`📋 Current permission: ${Notification.permission}`);

            // Try to get FCM token
            try {
                addLog('🔑 Requesting FCM token...');

                // First, request permission explicitly
                addLog('📱 Requesting notification permission...');
                const permission = await Notification.requestPermission();
                addLog(`📋 Permission result: ${permission}`);

                if (permission !== 'granted') {
                    addLog('❌ Permission not granted');
                    return;
                }

                const token = await requestNotificationPermission();

                if (token) {
                    addLog(`✅ FCM Token: ${token.substring(0, 20)}...`);

                    // Try to save token
                    addLog('💾 Saving token to server...');
                    try {
                        const response = await fetch('/api/push/save-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token }),
                        });

                        if (response.ok) {
                            addLog('✅ Token saved successfully!');
                        } else {
                            const error = await response.text();
                            addLog(`❌ Failed to save token: ${response.status} - ${error}`);
                        }
                    } catch (error: any) {
                        addLog(`❌ Network error saving token: ${error.message}`);
                    }
                } else {
                    addLog('❌ No token received from Firebase');
                }
            } catch (error: any) {
                addLog(`❌ Error: ${error.message}`);
                addLog(`❌ Stack: ${error.stack?.substring(0, 100)}`);
            }
        };

        testFCM();
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-black bg-opacity-90 text-white text-xs p-4 z-50 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">FCM Debug Log</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-red-400 hover:text-red-300"
                >
                    ✕
                </button>
            </div>

            {logs.some(log => log.includes('Permission result: denied')) && (
                <div className="mb-3 p-2 bg-yellow-900 rounded text-yellow-200">
                    <p className="font-bold mb-1">⚠️ 알림 권한이 차단되었습니다</p>
                    <p className="text-[10px]">브라우저 설정에서 알림 권한을 허용해주세요:</p>
                    <ol className="text-[10px] ml-3 mt-1 list-decimal">
                        <li>Safari: 설정 &gt; Safari &gt; 웹사이트 설정 &gt; 알림</li>
                        <li>Chrome: 주소창 왼쪽 자물쇠 아이콘 &gt; 권한 &gt; 알림</li>
                    </ol>
                </div>
            )}

            <div className="space-y-1 font-mono mb-2">
                {logs.map((log, i) => (
                    <div key={i} className="break-words">{log}</div>
                ))}
            </div>

            <button
                onClick={() => {
                    setLogs([]);
                    window.location.reload();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm font-bold"
            >
                🔄 다시 시도
            </button>
        </div>
    );
}
