'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyCount {
    date: string;
    manitto: number;
    target: number;
}

interface DailyMessageChartProps {
    data: DailyCount[];
}

export default function DailyMessageChart({ data }: DailyMessageChartProps) {
    // Find the first index where there is any message activity
    const firstActivityIndex = data.findIndex(item => item.manitto > 0 || item.target > 0);

    // If no activity found, show the last 7 days (or empty if preferred, but 7 days is safer context)
    // If activity found, slice from that index
    const filteredData = firstActivityIndex === -1
        ? data.slice(-7)
        : data.slice(firstActivityIndex);

    // Format data for display
    const formattedData = filteredData.map(item => ({
        date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        '비밀친구': item.manitto,
        '내 마니또 대상': item.target,
    }));

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">날짜별 대화 내역</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="비밀친구"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ fill: '#4F46E5', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="내 마니또 대상"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-indigo-600 mr-2"></div>
                    <span>비밀친구와의 대화</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
                    <span>내 마니또 대상과의 대화</span>
                </div>
            </div>
        </div>
    );
}
