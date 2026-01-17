-- ====================================================================
-- 🧹 ORPHANED DATA CLEANUP
-- ====================================================================
-- Purpose: Delete records where the user has ALREADY been deleted.
-- These records have 'user_id' as NULL due to previous specific deletions.
-- ====================================================================

BEGIN;

-- 1. Donations (Transactions without a user)
DELETE FROM public.donations WHERE user_id IS NULL;

-- 2. Feedback (Anonymous/Orphaned feedback)
DELETE FROM public.feedback WHERE user_id IS NULL;

-- 3. Activity Logs (Orphaned logs)
DELETE FROM public.activity_logs WHERE user_id IS NULL;

-- 4. Content Reports (Orphaned reports)
-- Delete if both reporter AND reported user are gone/null
DELETE FROM public.content_reports 
WHERE reporter_id IS NULL 
   OR reported_user_id IS NULL;

-- 5. Todo Lists (Just in case some slipped through, though they CASCADE)
-- DELETE FROM public.todo_lists WHERE user_id IS NULL;

COMMIT;

-- Verification
SELECT count(*) as orphaned_donations FROM public.donations WHERE user_id IS NULL;
