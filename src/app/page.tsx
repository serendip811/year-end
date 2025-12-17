'use client';

import { ArrowUpRight, ArrowDownLeft, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRelationships } from '@/hooks/useRelationships';
import RelationshipChart from '@/components/RelationshipChart';
import ConversationAnalysisModal from '@/components/ConversationAnalysisModal';

interface MessageStats {
  manitto: { sent: number; received: number };
  target: { sent: number; received: number };
}

interface DailyCount {
  date: string;
  manitto: { sent: number; received: number };
  target: { sent: number; received: number };
}

interface AnalysisData {
  hasAnalysis: boolean;
  data: {
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
  } | null;
}

function DashboardSkeleton() {
  return (
    <div className="h-full bg-white overflow-y-auto">
      <header className="px-4 py-3 border-b border-gray-200">
        <div className="h-7 w-16 bg-gray-200 rounded animate-pulse"></div>
      </header>
      <main className="p-4 space-y-3">
        {/* 내 마니또 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="h-3 w-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-7 w-14 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 차트 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse"></div>
          <div className="h-48 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* 챙겨줄 대상 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="h-4 w-44 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="h-3 w-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-7 w-14 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 차트 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="h-4 w-36 bg-gray-200 rounded mb-3 animate-pulse"></div>
          <div className="h-48 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useRelationships();
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyCount[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // 모달 상태
  const [isManittoModalOpen, setIsManittoModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [manittoAnalysis, setManittoAnalysis] = useState<AnalysisData | null>(null);
  const [targetAnalysis, setTargetAnalysis] = useState<AnalysisData | null>(null);

  // 분석 데이터 존재 여부
  const [hasManittoAnalysis, setHasManittoAnalysis] = useState(false);
  const [hasTargetAnalysis, setHasTargetAnalysis] = useState(false);

  useEffect(() => {
    // data가 없으면 API 호출하지 않음
    if (!data) return;

    const fetchAllData = async () => {
      setStatsLoading(true);
      try {
        // 모든 데이터를 병렬로 가져오기
        const [statsRes, dailyStatsRes, manittoAnalysisRes, targetAnalysisRes] = await Promise.all([
          fetch('/api/messages/stats'),
          fetch('/api/messages/daily-stats'),
          fetch('/api/conversation-analysis?type=target'),
          fetch('/api/conversation-analysis?type=manitto')
        ]);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson);
        }

        if (dailyStatsRes.ok) {
          const dailyStatsJson = await dailyStatsRes.json();
          setDailyStats(dailyStatsJson);
        }

        // 마니또 분석 데이터 존재 여부 확인
        if (manittoAnalysisRes.ok) {
          const manittoData = await manittoAnalysisRes.json();
          setHasManittoAnalysis(manittoData.hasAnalysis);
        }

        // 타겟 분석 데이터 존재 여부 확인
        if (targetAnalysisRes.ok) {
          const targetData = await targetAnalysisRes.json();
          setHasTargetAnalysis(targetData.hasAnalysis);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllData();
  }, [data]);

  // 대화 분석 공개 시간: 2025년 12월 18일 15시 (KST)
  const ANALYSIS_RELEASE_TIME = new Date('2025-12-18T15:15:00+09:00');

  // 공개 시간 체크 함수
  const checkReleaseTime = () => {
    const now = new Date();
    if (now < ANALYSIS_RELEASE_TIME) {
      const formatter = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Seoul'
      });
      alert(`대화 분석은 송년회 행사 이후에 공개됩니다.`);
      return false;
    }
    return true;
  };

  // 마니또 분석 데이터 가져오기
  const fetchManittoAnalysis = async () => {
    // 공개 시간 체크
    if (!checkReleaseTime()) {
      return;
    }

    try {
      const res = await fetch('/api/conversation-analysis?type=target');
      if (res.ok) {
        const data = await res.json();
        setManittoAnalysis(data);
        if (data.hasAnalysis) {
          setIsManittoModalOpen(true);
        } else {
          alert('아직 분석 데이터가 없습니다.');
        }
      }
    } catch (error) {
      console.error('Failed to fetch manitto analysis:', error);
      alert('분석 데이터를 불러올 수 없습니다.');
    }
  };

  // 타겟 분석 데이터 가져오기
  const fetchTargetAnalysis = async () => {
    // 공개 시간 체크
    if (!checkReleaseTime()) {
      return;
    }

    try {
      const res = await fetch('/api/conversation-analysis?type=manitto');
      if (res.ok) {
        const data = await res.json();
        setTargetAnalysis(data);
        if (data.hasAnalysis) {
          setIsTargetModalOpen(true);
        } else {
          alert('아직 분석 데이터가 없습니다.');
        }
      }
    } catch (error) {
      console.error('Failed to fetch target analysis:', error);
      alert('분석 데이터를 불러올 수 없습니다.');
    }
  };

  // 로딩 중이거나 데이터가 아직 없을 때 스켈레톤 표시
  if (isLoading || !data || statsLoading) return <DashboardSkeleton />;
  
  // 실제 에러가 발생했을 때만 에러 메시지 표시
  if (isError) return (
    <div className="h-full bg-white flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">데이터를 불러올 수 없습니다</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          새로고침
        </button>
      </div>
    </div>
  );

  const manittoChartData = dailyStats.map(item => ({
    date: item.date,
    sent: item.manitto.sent,
    received: item.manitto.received
  }));

  const targetChartData = dailyStats.map(item => ({
    date: item.date,
    sent: item.target.sent,
    received: item.target.received
  }));

  return (
    <div className="h-full bg-white overflow-y-auto">
      <header className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">홈</h1>
      </header>
      <main className="p-4 space-y-3">
        {/* 내 마니또와의 대화 통계 */}
        {data.manittoId && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  내 마니또
                </h2>
                {hasManittoAnalysis && (
                  <button
                    onClick={fetchManittoAnalysis}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    <MessageSquare size={14} />
                    대화 분석
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-900">보냄</span>
                    <ArrowUpRight className="text-indigo-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-indigo-600">
                    {stats?.manitto.sent || 0}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-900">받음</span>
                    <ArrowDownLeft className="text-indigo-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-indigo-600">
                    {stats?.manitto.received || 0}
                  </p>
                </div>
                <div className="bg-indigo-100 rounded-lg p-2">
                  <span className="text-xs font-medium text-indigo-900">총계</span>
                  <p className="text-xl font-bold text-indigo-600">
                    {(stats?.manitto.sent || 0) + (stats?.manitto.received || 0)}
                  </p>
                </div>
              </div>
            </div>
            {dailyStats.length > 0 && (
              <RelationshipChart
                data={manittoChartData}
                title="내 마니또와의 대화"
                color="indigo"
              />
            )}
          </>
        )}

        {/* 챙겨줄 대상과의 대화 통계 */}
        {data.target && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  챙겨줄 대상 ({data.target.name})
                </h2>
                {hasTargetAnalysis && (
                  <button
                    onClick={fetchTargetAnalysis}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    <MessageSquare size={14} />
                    대화 분석
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-900">보냄</span>
                    <ArrowUpRight className="text-green-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {stats?.target.sent || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-900">받음</span>
                    <ArrowDownLeft className="text-green-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {stats?.target.received || 0}
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <span className="text-xs font-medium text-green-900">총계</span>
                  <p className="text-xl font-bold text-green-600">
                    {(stats?.target.sent || 0) + (stats?.target.received || 0)}
                  </p>
                </div>
              </div>
            </div>
            {dailyStats.length > 0 && (
              <RelationshipChart
                data={targetChartData}
                title="챙겨줄 대상과의 대화"
                color="green"
              />
            )}
          </>
        )}
      </main>

      {/* 모달 */}
      {manittoAnalysis?.hasAnalysis && manittoAnalysis.data && (
        <ConversationAnalysisModal
          isOpen={isManittoModalOpen}
          onClose={() => setIsManittoModalOpen(false)}
          data={manittoAnalysis.data}
          type="target"
        />
      )}

      {targetAnalysis?.hasAnalysis && targetAnalysis.data && (
        <ConversationAnalysisModal
          isOpen={isTargetModalOpen}
          onClose={() => setIsTargetModalOpen(false)}
          data={targetAnalysis.data}
          type="manitto"
        />
      )}
    </div>
  );
}
