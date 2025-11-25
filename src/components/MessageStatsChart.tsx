'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MessageStatsChartProps {
    sent: number;
    received: number;
    title: string;
}

export default function MessageStatsChart({ sent, received, title }: MessageStatsChartProps) {
    const data = [
        {
            name: '메시지',
            보낸메시지: sent,
            받은메시지: received,
        },
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="보낸메시지" fill="#4F46E5" />
                    <Bar dataKey="받은메시지" fill="#10B981" />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-around text-xs text-gray-600">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-600 rounded mr-1"></div>
                    <span>보낸 메시지: {sent}개</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    <span>받은 메시지: {received}개</span>
                </div>
            </div>
        </div>
    );
}
