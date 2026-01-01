-- Todo Lists (for grouping todos)
CREATE TABLE IF NOT EXISTS public.todo_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'blue',
    icon TEXT DEFAULT 'list',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id UUID REFERENCES public.todo_lists(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.todos(id) ON DELETE CASCADE, -- For subtasks
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    due_time TEXT, -- HH:MM format for time-specific tasks
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    reminder_at TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT, -- daily, weekly, monthly, custom
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON public.todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON public.todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON public.todo_lists(user_id);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for todos
CREATE POLICY "Users can view own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for todo_lists
CREATE POLICY "Users can view own todo_lists" ON public.todo_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todo_lists" ON public.todo_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todo_lists" ON public.todo_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todo_lists" ON public.todo_lists
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default lists for existing users (optional)
-- Users will get "Inbox" list by default when they first access todos
