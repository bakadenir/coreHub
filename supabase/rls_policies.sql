-- ============================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- coreHub Database Security
-- ============================================

-- Enable RLS on all tables (run once per table)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES POLICIES
-- ============================================

-- Users can only view their own notes
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own notes
CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Public notes can be read by anyone
CREATE POLICY "Public notes are viewable by anyone" ON notes
    FOR SELECT USING (is_public = true);

-- ============================================
-- HABITS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HABIT_COMPLETIONS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own habit completions" ON habit_completions
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM habits WHERE id = habit_id)
    );

-- ============================================
-- SCHEDULES POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own schedules" ON schedules
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- LINKS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own links" ON links
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TODO_LISTS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own todo lists" ON todo_lists
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TODOS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own todos" ON todos
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM todo_lists WHERE id = list_id)
    );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PUSH_SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION_SETTINGS POLICIES
-- ============================================

CREATE POLICY "Users can CRUD own notification settings" ON notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK POLICIES
-- ============================================

-- Anyone can submit feedback
CREATE POLICY "Anyone can insert feedback" ON feedback
    FOR INSERT WITH CHECK (true);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- ============================================
-- DONATIONS POLICIES
-- ============================================

-- Anyone can create a donation
CREATE POLICY "Anyone can create donation" ON donations
    FOR INSERT WITH CHECK (true);

-- Users can view their own donations
CREATE POLICY "Users can view own donations" ON donations
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- Public donations (success) viewable by anyone
CREATE POLICY "Success donations are public" ON donations
    FOR SELECT USING (status = 'success');

-- ============================================
-- PROFILES POLICIES (if exists)
-- ============================================

-- Uncomment if you have a profiles table
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own profile" ON profiles
--     FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON profiles
--     FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- HOW TO APPLY THESE POLICIES
-- ============================================
-- 1. Go to Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Run the SQL
-- 5. Check Authentication > Policies to verify

-- Note: If policies already exist, you may need to drop them first:
-- DROP POLICY IF EXISTS "policy_name" ON table_name;
