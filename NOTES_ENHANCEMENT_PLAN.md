# Notes Enhancement Plan: Notion-Style Editor & Public Sharing

## Overview

Upgrade the Notes feature to support rich text/markdown editing with Notion-like experience and ability to share notes as public articles.

---

## Phase 1: Rich Text Editor (Priority: High)

### Tech Stack
- **TipTap v2** - Modern WYSIWYG editor built on ProseMirror
- **react-markdown** - For rendering markdown in read-only views

### New Dependencies
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-code-block-lowlight lowlight
```

### Features
- [x] Heading (H1, H2, H3)
- [x] Bold, Italic, Strikethrough
- [x] Bullet & Numbered Lists
- [x] Blockquote
- [x] Code blocks with syntax highlighting
- [x] Inline code
- [x] Links
- [x] Horizontal divider

### Files to Modify/Create
| File | Action | Description |
|------|--------|-------------|
| `components/RichTextEditor.tsx` | CREATE | TipTap editor component |
| `components/AddNoteModal.tsx` | MODIFY | Replace textarea with RichTextEditor |
| `components/EditNoteModal.tsx` | MODIFY | Replace textarea with RichTextEditor |
| `pages/Notes.tsx` | MODIFY | Render HTML content instead of plain text |

---

## Phase 2: Note Visibility & Public Sharing (Priority: Medium)

### Database Changes
```sql
ALTER TABLE notes ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN public_slug VARCHAR(255) UNIQUE;
```

### Backend API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes/:id/publish` | POST | Make note public, generate slug |
| `/api/notes/:id/unpublish` | POST | Make note private |
| `/api/public/notes/:slug` | GET | Get public note by slug (no auth) |

### Frontend
- Toggle button in note editor: "Make Public"
- Copy shareable link button
- Public article page at `/article/:slug`

---

## Phase 3: Public Article View (Priority: Medium)

### New Page: `/article/:slug`
- Clean, readable article layout
- No login required
- Shows: title, author name, date, content
- Optional: Share buttons (Twitter, LinkedIn, Copy Link)

### Design Principles
- Minimal design, focus on readability
- Max-width container (700px)
- Proper typography for long-form reading
- Responsive on mobile

---

## Phase 4: Advanced Features (Future)

### Optional Enhancements
- [ ] Image upload in notes
- [ ] Tables support
- [ ] Embed support (YouTube, etc)
- [ ] Collaborative editing
- [ ] Version history
- [ ] Export to PDF/Markdown
- [ ] SEO meta tags for public articles

---

## Estimated Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1 - Rich Text Editor | 2-3 days | High |
| Phase 2 - Public Sharing | 1-2 days | Medium |
| Phase 3 - Article View | 1 day | Medium |
| Phase 4 - Advanced | TBD | Low |

**Total MVP: ~5 days**

---

## Technical Notes

### Content Storage
- Store as HTML in database (TipTap outputs HTML)
- Alternative: Store as JSON (TipTap native format) for flexibility

### Security
- Sanitize HTML output to prevent XSS
- Use `DOMPurify` library for sanitization
- Public notes: rate limiting on public endpoint

### Slug Generation
- Auto-generate from title: `my-note-title-abc123`
- Include random suffix for uniqueness

---

## Questions to Decide

1. **Content format**: Store as HTML or JSON?
2. **Slug format**: Auto-generate or user-defined?
3. **Author display**: Show full name or username on public articles?
4. **Comments**: Allow comments on public articles? (future)
