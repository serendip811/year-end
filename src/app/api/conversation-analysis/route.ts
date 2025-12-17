import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // JWT 인증
        const payload = await getUserFromCookie();
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = payload.id as string;

        // Query parameter: type = 'manitto' | 'target'
        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'manitto' or 'target'

        if (!type || (type !== 'manitto' && type !== 'target')) {
            return NextResponse.json(
                { error: 'Invalid type parameter. Must be "manitto" or "target"' },
                { status: 400 }
            );
        }

        // RPC 호출
        const relationshipType = type === 'manitto' ? 'as_manitto' : 'as_target';
        const { data, error } = await supabaseAdmin.rpc('get_user_conversation_analysis', {
            uid: userId,
            relationship_type: relationshipType
        });

        if (error) {
            console.error('Error fetching conversation analysis:', error);
            return NextResponse.json(
                { error: 'Failed to fetch analysis' },
                { status: 500 }
            );
        }

        // 데이터가 없는 경우 (분석 데이터 없음)
        if (!data || data.length === 0) {
            return NextResponse.json({
                hasAnalysis: false,
                data: null
            });
        }

        // Snake case를 camelCase로 변환
        const analysisData = data[0];
        const formattedData = {
            manittoName: analysisData.manitto_name,
            targetName: analysisData.target_name,
            messageCount: analysisData.message_count,
            intimacyScore: analysisData.intimacy_score,
            depthScore: analysisData.depth_score,
            emotionalScore: analysisData.emotional_score,
            humorScore: analysisData.humor_score,
            personalSharingScore: analysisData.personal_sharing_score,
            totalScore: analysisData.total_score,
            comprehensiveAnalysis: analysisData.comprehensive_analysis
        };

        return NextResponse.json({
            hasAnalysis: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Error in conversation analysis API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
