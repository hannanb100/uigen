# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack (uses node-compat.cjs)
npm run build        # Production build
npm run lint         # ESLint

# Testing
npm test             # Run all Vitest tests
npx vitest run src/path/to/file.test.ts  # Run a single test file

# Database
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database (destructive)
npx prisma migrate dev  # Apply new migrations
npx prisma generate     # Regenerate Prisma client after schema changes
```

## Architecture

UIGen is a Next.js 15 App Router app that uses Claude AI to generate React components with live preview. Files exist only in memory (virtual file system) — nothing is written to disk during generation.

### Core Data Flow

```
User prompt → ChatInterface → useChat() → POST /api/chat
  → streamText() calls Claude with tools
  → Claude calls str_replace_editor / file_manager tools
  → Tools mutate VirtualFileSystem (in-memory)
  → FileSystemContext triggers PreviewFrame refresh
  → PreviewFrame: Babel transforms JSX → import map → srcdoc iframe
```

### Key Abstractions

**VirtualFileSystem** (`src/lib/file-system.ts`) — In-memory tree of files/dirs. All AI tool operations (`view`, `create`, `str_replace`, `insert`, `rename`, `delete`) go through this class. It serializes to JSON for DB persistence.

**Two Contexts:**
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — holds the `VirtualFileSystem` instance, selected file, refresh triggers, and the tool call handlers that AI invokes
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat()`, wires tool results back to the file system, handles anonymous session tracking

**AI Tool Definitions** (`src/lib/tools/`) — Two tools exposed to Claude:
- `str_replace_editor`: view/create/str_replace/insert on files
- `file_manager`: rename/delete files and directories

**Live Preview** (`src/components/preview/PreviewFrame.tsx` + `src/lib/transform/jsx-transformer.ts`) — Detects entry point (App.jsx → App.tsx → index.jsx → index.tsx), transforms with Babel Standalone, builds an import map pointing local files and npm packages (via esm.sh CDN), injects everything into a sandboxed iframe via `srcdoc`.

**Provider** (`src/lib/provider.ts`) — `getLanguageModel()` returns real Anthropic model when `ANTHROPIC_API_KEY` is set, otherwise a `MockLanguageModel` with static responses.

### Authentication & Persistence

- JWT tokens (Jose), httpOnly cookies, 7-day expiry
- `src/middleware.ts` guards protected routes
- Server actions in `src/actions/` handle project CRUD
- Projects store messages + file system state as JSON blobs in SQLite via Prisma
- Anonymous users: work tracked in localStorage (`src/lib/anon-work-tracker.ts`); projects have nullable `userId`
- Database schema is the source of truth for all stored data: see `prisma/schema.prisma`

### Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- **AI:** Anthropic Claude Haiku 4.5 via `@ai-sdk/anthropic`, Vercel AI SDK for streaming
- **DB:** Prisma 6 + SQLite (`prisma/dev.db`)
- **UI:** Radix UI + shadcn/ui, Monaco Editor, React Resizable Panels
- **Testing:** Vitest with jsdom, Testing Library
- **Path alias:** `@/*` → `src/*`
