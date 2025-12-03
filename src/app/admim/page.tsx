'use client';

import { useState, useEffect } from 'react';

interface DailyStat {
    date: string;
    aToBCount: number;
    bToACount: number;
}

interface Relationship {
    userAName: string;
    userBName: string;
    aToBTotal: number;
    bToATotal: number;
    totalMessages: number;
    dailyStats: DailyStat[];
}

interface StatsResponse {
    relationships: Relationship[];
}

export default function AdminPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Start with loading for auto-login
    const [error, setError] = useState('');
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [startDate, setStartDate] = useState(
      new Date("2025-12-01").toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [showNames, setShowNames] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-login on mount
    useEffect(() => {
        const savedPassword = localStorage.getItem('admim_password');
        if (savedPassword) {
            setPassword(savedPassword);
            autoLogin(savedPassword);
        } else {
            setLoading(false);
        }
    }, []);

    const autoLogin = async (pwd: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admim/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: pwd,
                    startDate,
                    endDate,
                }),
            });

            if (!response.ok) {
                // Password is invalid, clear localStorage
                localStorage.removeItem('admim_password');
                throw new Error('자동 로그인 실패');
            }

            const data = await response.json();
            setStats(data);
            setIsAuthenticated(true);
        } catch (err: any) {
            setError('');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admim/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    startDate,
                    endDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '비밀번호가 올바르지 않습니다');
            }

            const data = await response.json();
            setStats(data);
            setIsAuthenticated(true);
            
            // Save password to localStorage
            localStorage.setItem('admim_password', password);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchStats = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admim/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    startDate,
                    endDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admim_password');
        setIsAuthenticated(false);
        setStats(null);
        setPassword('');
    };


    // Get all unique dates from stats
    const getAllDates = (): string[] => {
        if (!stats || !stats.relationships || stats.relationships.length === 0) {
            return [];
        }

        const dateSet = new Set<string>();
        stats.relationships.forEach((rel) => {
            rel.dailyStats.forEach((stat) => {
                dateSet.add(stat.date);
            });
        });

        return Array.from(dateSet).sort();
    };

    const dates = getAllDates();

    // Loading screen
    if (loading && !isAuthenticated && !error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    // Mobile warning screen
    if (isMobile) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50 px-4 z-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            PC에서 접속해주세요
                        </h2>
                        <p className="text-gray-600 mb-6">
                            관리자 페이지는 더 나은 사용 경험을 위해<br />
                            데스크톱 환경에서만 이용 가능합니다.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 text-left">
                            <p className="text-sm text-blue-800">
                                <strong>💡 안내</strong><br />
                                태블릿 또는 PC의 큰 화면에서<br />
                                접속해주시기 바랍니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Password authentication screen
    if (!isAuthenticated || !stats) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 z-50">
                <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-xl p-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            관리자 페이지
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            마니또 메시지 통계를 확인하세요
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    관리자 비밀번호
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? '확인 중...' : '로그인'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-8 overflow-auto z-50">
            <div className="max-w-[95%] mx-auto">
                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                🎯 마니또 메시지 통계
                            </h1>
                            <div className="flex gap-4 items-center mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 font-medium">시작:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <span className="text-gray-400">~</span>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 font-medium">종료:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNames(!showNames)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    showNames
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {showNames ? '이름 가리기' : '이름 보기'}
                            </button>
                            <button
                                onClick={handleFetchStats}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? '조회 중...' : '조회'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    {error}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {stats && stats.relationships && (
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky left-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-10" rowSpan={2}>
                                            관계
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider" colSpan={2}>
                                            총 메시지
                                        </th>
                                        {dates.map((date) => (
                                            <th
                                                key={date}
                                                className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                                                colSpan={2}
                                            >
                                                {new Date(date).toLocaleDateString('ko-KR', {
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                })}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase tracking-wider bg-blue-700">
                                            →
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase tracking-wider bg-indigo-700">
                                            ←
                                        </th>
                                        {dates.map((date) => (
                                            <>
                                                <th key={`${date}-to`} className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider bg-blue-700">
                                                    →
                                                </th>
                                                <th key={`${date}-from`} className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider bg-indigo-700">
                                                    ←
                                                </th>
                                            </>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.relationships.map((rel, idx) => {
                                        const statsMap = new Map(
                                            rel.dailyStats.map((s) => [s.date, { aToB: s.aToBCount, bToA: s.bToACount }])
                                        );

                                        return (
                                            <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white hover:bg-blue-50 z-10 border-r border-gray-200">
                                                    <span className="inline-flex items-center">
                                                        {showNames ? rel.userAName : '***'}
                                                        <span className="mx-2 text-blue-600">↔</span>
                                                        {showNames ? rel.userBName : '***'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-blue-700 font-bold bg-blue-50">
                                                    {rel.aToBTotal}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-indigo-700 font-bold bg-indigo-50">
                                                    {rel.bToATotal}
                                                </td>
                                                {dates.map((date) => {
                                                    const stat = statsMap.get(date) || { aToB: 0, bToA: 0 };
                                                    return (
                                                        <>
                                                            <td
                                                                key={`${date}-to`}
                                                                className={`px-2 py-4 whitespace-nowrap text-sm text-center ${
                                                                    stat.aToB > 0
                                                                        ? 'text-blue-900 font-bold bg-blue-100'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            >
                                                                {stat.aToB > 0 ? stat.aToB : '·'}
                                                            </td>
                                                            <td
                                                                key={`${date}-from`}
                                                                className={`px-2 py-4 whitespace-nowrap text-sm text-center ${
                                                                    stat.bToA > 0
                                                                        ? 'text-indigo-900 font-bold bg-indigo-100'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            >
                                                                {stat.bToA > 0 ? stat.bToA : '·'}
                                                            </td>
                                                        </>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {stats && (!stats.relationships || stats.relationships.length === 0) && (
                    <div className="bg-white rounded-xl shadow-xl p-12 text-center">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <p className="text-gray-500 text-lg">표시할 데이터가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

