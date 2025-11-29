# CalistheniX - AI Agent Guide

## ⚠️ CRITICAL Git Rules **MOST IMPORTANT**
- Commit AFTER each complete feature: `git add . && git commit -m "feat: description"`
- Use "feat:", "fix:", "refactor:" prefixes
- Test before committing - never commit broken code
- Donot commit greated than 150-200 at once. commit periodically

## 🤖 AI Agent Guidelines
**Read this entire file first. Check integration status before starting.**

### File Editing:
- Edit one file at a time
- Include 3-5 lines context before/after changes
- Test after each change - console should be clean
- Use absolute paths only

### API Pattern:
```typescript
export function useNewFeature() {
  return useQuery({
    queryKey: ["/api/new-feature"],
    queryFn: async () => {
      const res = await fetch("/api/new-feature", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });
}
```

## 📍 Project Overview
Full-stack calisthenics app: React 19 + Vite + Express + PostgreSQL + Drizzle ORM
Status: ~70% complete - Profile page just integrated

## 🗂️ Key Files
- `shared/schema.ts` - Database schema & types
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database methods
- `client/src/hooks/` - TanStack Query hooks
- `client/src/pages/` - Page components

## 🚀 Quick Start
```bash
npm install
npx tsx seed.ts  # Seed database
npm run dev      # Start server
# Visit http://localhost:5000
```

## 📊 API Endpoints
### Auth: `/api/login`, `/api/logout`, `/api/auth/user`
### Profile: `GET /api/users/me` ⭐ NEW
### Workouts: `GET/POST /api/workouts`, `GET/POST /api/workouts/:id/exercises`
### Exercises: `GET /api/exercises`, `GET /api/exercises/:slug`
### Journal: `GET/POST /api/journal`
### Records: `GET/POST /api/records`
### Stats: `GET /api/stats/weekly-volume`

## ✅ Integration Checklist
- [ ] Read this guide completely
- [ ] Check status table below
- [ ] Backend: schema → storage → routes
- [ ] Frontend: hook → component with loading/error states
- [ ] Test: browser clean, no console errors
- [ ] Commit with meaningful message

## 🎯 Current Status
| Page | Status | Priority |
|------|--------|----------|
| Landing | ✅ Complete | - |
| Profile | ✅ **DONE** | ✅ |
| Home | ⚠️ 60% | HIGH |
| Workout | ❌ 10% | HIGH |
| Roadmap | ❌ 5% | MEDIUM |
| Coach | ❌ 0% | LOW |

## 📝 Next Tasks
1. **Workout Page**: Connect to `/api/workouts` and `/api/workouts/:id/exercises`
2. **Home Page**: Replace hardcoded data with real user data
3. **Roadmap Page**: Connect to user level/progress

## 🚨 Troubleshooting
- Reset DB: `npx tsx seed.ts`
- Clear browser data: cookies, localStorage
- Restart: `Ctrl+C` then `npm run dev`
- Check logs and `.env` file

## 📚 Must-Read Files
1. `agent.md` (this file)
2. `shared/schema.ts`
3. `server/routes.ts`
4. `client/src/hooks/useMe.ts`
5. `client/src/pages/profile.tsx`

**Version 4.0 - Ultra Condensed**