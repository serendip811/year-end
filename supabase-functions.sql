-- Function to get user relationship info (single query)
CREATE OR REPLACE FUNCTION get_user_relationship(uid UUID)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    target_id UUID,
    target_name TEXT,
    manitto_from UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.name AS user_name,
        t.id AS target_id,
        t.name AS target_name,
        u.manitto_from
    FROM users u
    LEFT JOIN users t ON u.manitto_to = t.id
    WHERE u.id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get message stats for a user
CREATE OR REPLACE FUNCTION get_user_message_stats(uid UUID)
RETURNS JSON AS $$
DECLARE
    manitto_from_id UUID;
    manitto_to_id UUID;
    result JSON;
BEGIN
    -- Get user relationships
    SELECT manitto_from, manitto_to
    INTO manitto_from_id, manitto_to_id
    FROM users
    WHERE id = uid;

    -- Build the result JSON
    SELECT json_build_object(
        'manitto', json_build_object(
            'sent', COALESCE((
                SELECT COUNT(*)
                FROM messages
                WHERE sender = uid
                AND receiver = manitto_from_id
            ), 0),
            'received', COALESCE((
                SELECT COUNT(*)
                FROM messages
                WHERE sender = manitto_from_id
                AND receiver = uid
            ), 0)
        ),
        'target', json_build_object(
            'sent', COALESCE((
                SELECT COUNT(*)
                FROM messages
                WHERE sender = uid
                AND receiver = manitto_to_id
            ), 0),
            'received', COALESCE((
                SELECT COUNT(*)
                FROM messages
                WHERE sender = manitto_to_id
                AND receiver = uid
            ), 0)
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get daily message stats for a user
-- DB 타임존이 KST로 설정되어 있으므로 타임존 변환 불필요
CREATE OR REPLACE FUNCTION get_user_daily_message_stats(uid UUID)
RETURNS JSON AS $$
DECLARE
    manitto_from_id UUID;
    manitto_to_id UUID;
    result JSON;
BEGIN
    -- Get user relationships
    SELECT manitto_from, manitto_to
    INTO manitto_from_id, manitto_to_id
    FROM users
    WHERE id = uid;

    -- Generate daily stats for the last 30 days (DB가 이미 KST)
    WITH date_series AS (
        SELECT
            (CURRENT_DATE - generate_series(0, 29))::date AS date
    ),
    manitto_stats AS (
        SELECT
            created_at::date AS date,
            COUNT(*) FILTER (WHERE sender = uid) AS sent,
            COUNT(*) FILTER (WHERE sender = manitto_from_id) AS received
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '31 days'
        AND (
            (sender = uid AND receiver = manitto_from_id) OR
            (sender = manitto_from_id AND receiver = uid)
        )
        GROUP BY created_at::date
    ),
    target_stats AS (
        SELECT
            created_at::date AS date,
            COUNT(*) FILTER (WHERE sender = uid) AS sent,
            COUNT(*) FILTER (WHERE sender = manitto_to_id) AS received
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '31 days'
        AND (
            (sender = uid AND receiver = manitto_to_id) OR
            (sender = manitto_to_id AND receiver = uid)
        )
        GROUP BY created_at::date
    )
    SELECT json_agg(
        json_build_object(
            'date', ds.date,
            'manitto', json_build_object(
                'sent', COALESCE(ms.sent, 0),
                'received', COALESCE(ms.received, 0)
            ),
            'target', json_build_object(
                'sent', COALESCE(ts.sent, 0),
                'received', COALESCE(ts.received, 0)
            )
        )
        ORDER BY ds.date ASC
    ) INTO result
    FROM date_series ds
    LEFT JOIN manitto_stats ms ON ds.date = ms.date
    LEFT JOIN target_stats ts ON ds.date = ts.date;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
