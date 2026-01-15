-- ============================================
-- COREHUB RLS POLICIES (v2)
-- Run this AFTER schema.sql
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES POLICIES
-- ============================================
CREATE POLICY "notes_select" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON public.notes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notes_public_select" ON public.notes FOR SELECT USING (is_public = true);

-- ============================================
-- HABITS POLICIES
-- ============================================
CREATE POLICY "habits_all" ON public.habits FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HABIT COMPLETIONS POLICIES
-- ============================================
CREATE POLICY "habit_completions_all" ON public.habit_completions
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM public.habits WHERE id = habit_id)
    );

-- ============================================
-- SCHEDULE EVENTS POLICIES
-- ============================================
CREATE POLICY "schedule_events_all" ON public.schedule_events FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SCHEDULE ATTENDEES POLICIES
-- ============================================
CREATE POLICY "schedule_attendees_all" ON public.schedule_attendees
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM public.schedule_events WHERE id = event_id)
    );

-- ============================================
-- LINKS POLICIES
-- ============================================
CREATE POLICY "links_all" ON public.links FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- LINK TAGS POLICIES
-- ============================================
CREATE POLICY "link_tags_all" ON public.link_tags
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM public.links WHERE id = link_id)
    );

-- ============================================
-- TODO LISTS POLICIES
-- ============================================
CREATE POLICY "todo_lists_all" ON public.todo_lists FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TODOS POLICIES
-- ============================================
CREATE POLICY "todos_all" ON public.todos FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION SETTINGS POLICIES
-- ============================================
CREATE POLICY "notification_settings_all" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PUSH SUBSCRIPTIONS POLICIES
-- ============================================
CREATE POLICY "push_subscriptions_all" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK POLICIES
-- ============================================
-- Feedback INSERT: validate message is not empty
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT WITH CHECK (message IS NOT NULL AND message <> '');
-- Feedback SELECT: users can see their own feedback
CREATE POLICY "feedback_select" ON public.feedback FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- ============================================
-- DONATIONS POLICIES
-- ============================================
-- Donations INSERT: validate amount is positive
CREATE POLICY "donations_insert" ON public.donations FOR INSERT WITH CHECK (amount > 0);
-- Donations SELECT: users can see their own donations
CREATE POLICY "donations_select_own" ON public.donations FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
-- Donations SELECT: anyone can see successful donations (for public display)
CREATE POLICY "donations_select_public" ON public.donations FOR SELECT USING (status = 'success');

-- ============================================
-- ACTIVITY LOGS POLICIES
-- Note: Logs are inserted via service_role (backend), 
-- users should not have direct access
-- ============================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
-- Backend uses service_role to insert, so no user INSERT policy needed
-- No SELECT policy for regular users (admin access via backend only)

-- ============================================
-- PROFILES POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Users can read all profiles (for displaying author names, etc.)
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Users can insert their own profile (on registration)
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- CONTENT REPORTS POLICIES
-- ============================================
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
-- Users can submit reports (INSERT)
CREATE POLICY "content_reports_insert" ON public.content_reports 
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- Users can view their own submitted reports
CREATE POLICY "content_reports_select_own" ON public.content_reports 
    FOR SELECT USING (auth.uid() = reporter_id);
-- Admin access is via service_role (backend), no special policy needed

-- ============================================
-- DONE! RLS policies applied.
-- ============================================

