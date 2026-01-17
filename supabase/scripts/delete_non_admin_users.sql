-- ====================================================================
-- 🧨 BRUTAL CLEANUP SCRIPT (Handles Everything)
-- ====================================================================
-- Purpose: Completely wipe non-admin users and ALL their data.
-- 
-- 1. Main Data (Notes, Habits, Todos, etc.):
--    Automatically deleted by Postgres CASCADE (defined in schema).
-- 
-- 2. "Set Null" Data (Feedback, Donations, Logs):
--    Normally kept anonymously. This script FORCES deletion of these too.
-- ====================================================================

DO $$
DECLARE
    target_user_ids UUID[];
BEGIN
    -- 1. Identify non-admin users
    SELECT array_agg(id) INTO target_user_ids
    FROM auth.users
    WHERE COALESCE(raw_user_meta_data->>'role', 'user') != 'admin';

    IF target_user_ids IS NOT NULL THEN
        -- 2. Delete from tables that usually keep data (ON DELETE SET NULL)
        -- We want to remove them completely instead of keeping them anonymous.
        DELETE FROM public.feedback WHERE user_id = ANY(target_user_ids);
        DELETE FROM public.donations WHERE user_id = ANY(target_user_ids);
        DELETE FROM public.activity_logs WHERE user_id = ANY(target_user_ids);
        DELETE FROM public.content_reports WHERE reporter_id = ANY(target_user_ids) OR reported_user_id = ANY(target_user_ids);

        -- 3. Delete the Users
        -- This triggers ON DELETE CASCADE for:
        -- - public.profiles
        -- - public.notes
        -- - public.habits
        -- - public.todos
        -- - public.links
        -- - public.schedules
        -- - public.notifications
        DELETE FROM auth.users WHERE id = ANY(target_user_ids);
        
        RAISE NOTICE 'Deleted % non-admin users and all their associated data.', array_length(target_user_ids, 1);
    ELSE
        RAISE NOTICE 'No non-admin users found to delete.';
    END IF;
END $$;
