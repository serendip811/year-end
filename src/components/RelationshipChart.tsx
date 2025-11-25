'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyData {
    date: string;
    sent: number;
    received: number;
}

interface RelationshipChartProps {
    data: DailyData[];
    title: string;
    color: string;
}

export default function RelationshipChart({ data, title, color }: RelationshipChartProps) {
    // Find the first index where there is any message activity
    const firstActivityIndex = data.findIndex(item => item.sent > 0 || item.received > 0);

    // If no activity found, show the last 7 days
    const filteredData = firstActivityIndex === -1
        ? data.slice(-7)
        : data.slice(firstActivityIndex);

    // Format data for display
    const formattedData = filteredData.map(item => ({
        date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        '보낸 메시지': item.sent,
        '받은 메시지': item.received,
    }));

    const sentColor = color === 'indigo' ? '#4F46E5' : '#10B981';
    const receivedColor = color === 'indigo' ? '#818CF8' : '#6EE7B7';

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                        type="monotone"
                        dataKey="보낸 메시지"
                        stroke={sentColor}
                        strokeWidth={2}
                        dot={{ fill: sentColor, r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="받은 메시지"
                        stroke={receivedColor}
                        strokeWidth={2}
                        dot={{ fill: receivedColor, r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
