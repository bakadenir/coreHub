# Changelog

All notable changes to CoreHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-15

### 🎉 Initial Production Release

First complete version of CoreHub productivity application.

### Added

#### Core Features
- **📝 Notes** - Rich Text Editor (TipTap) dengan:
  - Markdown & WYSIWYG editing modes
  - Code blocks with syntax highlighting
  - Mermaid diagram support
  - Public note sharing via URL slug
  - Pin & tag notes
  
- **✅ Todo Lists** - Task management dengan:
  - Multiple lists dengan custom colors & icons
  - Subtasks support
  - Priority levels (low, medium, high, urgent)
  - Due dates & reminders
  - Recurring tasks
  
- **🎯 Habits Tracker** - Daily habit tracking dengan:
  - Daily/weekly frequency options
  - Streak counting
  - Reminder times
  - Categories & icons

- **📅 Schedule** - Calendar management dengan:
  - Day/week/month views
  - All-day events
  - Location & platform fields
  - Recurrence patterns
  
- **🔗 Links** - Bookmark manager dengan:
  - Auto-fetch title & description
  - Tag organization
  - Pin favorites

- **🏠 Dashboard** - Personalized overview dengan:
  - Drag-and-drop activity cards
  - Today's habits, todos, schedule
  - Quick actions
  - Clock & location widgets

#### Additional Features
- **⏱️ Pomodoro Timer** - Focus timer dengan customizable durations
- **🔔 Notifications** - Real-time via SSE + push notifications
- **🔍 Global Search** - Search across notes, links, todos, schedules
- **👤 User Profiles** - Avatar picker, profile settings
- **⚙️ Settings** - Theme, notifications, account management
- **👑 Admin Panel** - User management & activity logs
- **💳 Donations** - Midtrans payment integration

### Technical
- **Frontend**: React 19, Vite 7, Tailwind CSS 3, TipTap Editor
- **Backend**: Express.js, TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **State**: SWR, React Context
- **UI**: Lucide icons, dnd-kit

---

## [0.9.0] - 2025-12-23

### Changed
- **Database Migration** - Migrated from Better Auth + Drizzle ORM to Supabase Cloud
- **Authentication** - Switched to Supabase Auth (JWT-based)
- All 13 backend services rewritten for Supabase client

### Removed
- Drizzle ORM configuration
- Better Auth dependencies
- Local PostgreSQL requirement (now using Supabase Cloud)

---

## [0.8.0] - 2025-12-22

### Changed
- **Frontend Migration** - Evaluated Next.js migration (reverted, staying with Vite)
- Fixed hydration errors
- Cleaned up legacy Express.js files

---

## [0.7.0] - 2025-12-20

### Added
- **Rich Text Editor** - TipTap integration with bubble menu
- **Public Notes** - Share notes via public URL
- **Article Page** - Clean reading experience for shared notes

### Fixed
- Note auto-save functionality
- Shared note display issues

---

## [0.6.0] - 2025-01-14

### Added
- **Todo Reminders** - Notification for todos due today
- **Notification Sound** - Audio chime for new notifications

### Fixed
- Editor toolbar layout issues
- Shared note width consistency

---

## [0.5.0] - 2025-01-09

### Added
- **Todo Lists Feature** - Complete task management system
- **Subtasks** - Hierarchical task organization
- **Priority Levels** - Low, medium, high, urgent

---

## [0.4.0] - 2025-01-08

### Added
- **Dashboard Widgets** - Clock, location, activity cards
- **Drag & Drop** - Reorderable dashboard cards

---

## [0.3.0] - 2024-12-XX

### Added
- **Habits Tracker** - Daily/weekly habit tracking
- **Streak Counter** - Track consecutive completions

---

## [0.2.0] - 2024-12-XX

### Added
- **Schedule Feature** - Calendar with event management
- **Links Manager** - Bookmark saving with tags

---

## [0.1.0] - 2024-12-XX

### Added
- Initial project setup
- Basic authentication (login/register)
- Notes feature (plain text)
- Project structure (monorepo with apps/api and apps/web)

---

## Legend

- 🎉 Major release
- ✨ New feature
- 🔧 Improvement
- 🐛 Bug fix
- 💥 Breaking change
- 🗑️ Deprecated
