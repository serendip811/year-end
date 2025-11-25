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

    -- Generate daily stats for the last 30 days in KST
    WITH date_series AS (
        SELECT
            (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29))::date AS date
    ),
    manitto_stats AS (
        SELECT
            (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date AS date,
            COUNT(*) FILTER (WHERE sender = uid) AS sent,
            COUNT(*) FILTER (WHERE sender = manitto_from_id) AS received
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '31 days'
        AND (
            (sender = uid AND receiver = manitto_from_id) OR
            (sender = manitto_from_id AND receiver = uid)
        )
        GROUP BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date
    ),
    target_stats AS (
        SELECT
            (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date AS date,
            COUNT(*) FILTER (WHERE sender = uid) AS sent,
            COUNT(*) FILTER (WHERE sender = manitto_to_id) AS received
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '31 days'
        AND (
            (sender = uid AND receiver = manitto_to_id) OR
            (sender = manitto_to_id AND receiver = uid)
        )
        GROUP BY (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date
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
