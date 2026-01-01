# Restarting Servers and Fixing Configuration

## Task
The user is experiencing issues with the frontend connecting to a specific IP (`192.168.1.14:3001`) which causes errors locally. Additionally, there are database connection issues.

## Progress
- [x] Search and Replace IP: Replaced `192.168.1.14` with `localhost` in `apps/api/.env`. verified `apps/web` config.
- [x] Create Migration: Created `supabase/migrations/002_add_content_type.sql` to fix the missing column.
- [ ] Run Migration: User needs to run this on Supabase.
- [ ] Restart Servers:
    - [x] Backend (`apps/api`) started.
    - [ ] Frontend (`apps/web`) needs to be started (blocked by serial execution).
- [ ] Verify: Ensure the app loads.

## Next Steps
1.  Start frontend server in a separate process.
2.  Instruct user to run the migration script in Supabase dashboard.
3.  Instruct user to clear local storage.
