'use client';

import { useState, useEffect } from 'react';

// Global log storage
let globalLogs: string[] = [];
let logListeners: ((logs: string[]) => void)[] = [];

export const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    globalLogs = [...globalLogs, `[${timestamp}] ${message}`];
    logListeners.forEach(listener => listener(globalLogs));
};

export const clearDebugLogs = () => {
    globalLogs = [];
    logListeners.forEach(listener => listener([]));
};

export default function FCMDebugger() {
    const [logs, setLogs] = useState<string[]>(globalLogs);
    const [isVisible, setIsVisible] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        // Check localStorage for debug setting
        const debugEnabled = localStorage.getItem('fcm_debug_enabled') === 'true';
        setIsEnabled(debugEnabled);
        setIsVisible(debugEnabled);

        // Subscribe to log updates
        logListeners.push(setLogs);

        // Initial test
        addDebugLog('🔍 FCM Debugger initialized');

        // Listen for storage changes (for cross-tab updates)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'fcm_debug_enabled') {
                const enabled = e.newValue === 'true';
                setIsEnabled(enabled);
                setIsVisible(enabled);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            logListeners = logListeners.filter(l => l !== setLogs);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (!isEnabled || !isVisible) return null;

    return (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-black bg-opacity-95 text-white text-xs p-4 z-50 max-h-96 overflow-y-auto">
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

            <div className="space-y-1 font-mono mb-2 max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                    <div key={i} className="break-words text-[10px]">{log}</div>
                ))}
            </div>

            <button
                onClick={() => {
                    clearDebugLogs();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm font-bold"
            >
                🗑️ 로그 지우기
            </button>
        </div>
    );
}
