'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisData {
    manittoName: string;
    targetName: string;
    messageCount: number;
    intimacyScore: number;
    depthScore: number;
    emotionalScore: number;
    humorScore: number;
    personalSharingScore: number;
    totalScore: number;
    comprehensiveAnalysis: string;
}

interface ConversationAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: AnalysisData;
    type: 'manitto' | 'target'; // 'manitto': 내가 마니또, 'target': 내가 타겟
}

export default function ConversationAnalysisModal({
    isOpen,
    onClose,
    data,
    type
}: ConversationAnalysisModalProps) {
    if (!isOpen) return null;

    const title = type === 'target'
        ? `내 마니또와의 대화 분석`
        : `${data.targetName}님과의 대화 분석`;

    const colorTheme = type === 'target' ? 'indigo' : 'green';

    const scoreColor = colorTheme === 'indigo'
        ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
        : 'bg-green-50 text-green-900 border-green-200';

    const headerColor = colorTheme === 'indigo'
        ? 'bg-indigo-600'
        : 'bg-green-600';

    const progressColor = colorTheme === 'indigo'
        ? 'bg-indigo-600'
        : 'bg-green-600';

    const textColor = colorTheme === 'indigo'
        ? 'text-indigo-600'
        : 'text-green-600';

    const scores = [
        { label: '친밀도', value: data.intimacyScore, icon: '💕' },
        { label: '깊이', value: data.depthScore, icon: '🌊' },
        { label: '감정적교류', value: data.emotionalScore, icon: '❤️' },
        { label: '유머', value: data.humorScore, icon: '😄' },
        { label: '개인적공유', value: data.personalSharingScore, icon: '🤝' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                        onClick={onClose}
                    />

                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-white rounded-lg shadow-2xl z-[9999] flex flex-col max-h-[90vh]"
                    >
                        {/* 헤더 */}
                        <div className={`${headerColor} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 컨텐츠 */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {/* 메시지 수 */}
                            <div className="mb-4 text-center">
                                <p className="text-sm text-gray-600">총 메시지</p>
                                <p className={`text-3xl font-bold ${textColor}`}>
                                    {data.messageCount}개
                                </p>
                            </div>

                            {/* 점수 그리드 */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {scores.map((score) => (
                                    <div
                                        key={score.label}
                                        className={`${scoreColor} border rounded-lg p-3`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium">{score.label}</span>
                                            <span className="text-lg">{score.icon}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold">{score.value}</span>
                                            <span className="text-xs text-gray-600">/10</span>
                                        </div>
                                        {/* 진행바 */}
                                        <div className="mt-2 h-1.5 bg-white bg-opacity-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${progressColor}`}
                                                style={{ width: `${(score.value / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 총점 */}
                            <div className={`${scoreColor} border-2 rounded-lg p-4 mb-4`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">총점</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">{data.totalScore}</span>
                                        <span className="text-sm text-gray-600">/50</span>
                                    </div>
                                </div>
                                <div className="mt-2 h-2 bg-white bg-opacity-50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${progressColor}`}
                                        style={{ width: `${(data.totalScore / 50) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* 종합 분석 */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <span>📝</span>
                                    종합 분석
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.comprehensiveAnalysis}
                                </p>
                            </div>
                        </div>

                        {/* 푸터 */}
                        <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition"
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
