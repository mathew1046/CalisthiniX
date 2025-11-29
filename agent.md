# CalistheniX - AI Agent Guide

## ⚠️ CRITICAL Git Rules **MOST IMPORTANT**
- Commit AFTER each complete feature: `git add . && git commit -m "feat: description"`
- Use "feat:", "fix:", "refactor:" prefixes
- Test before committing - never commit broken code
- Do not commit greater than 150-200 lines at once. Commit periodically

## 🤖 AI Agent Guidelines
**Read this entire file first. Check `logs/integration-status.md` for detailed status.**

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
**Status: ~45-50% complete** (see detailed report in `/logs/integration-status.md`)

## 🎯 Planned Features (9 Total)
| # | Feature | Status | Progress |
|---|---------|--------|----------|
| 1 | Calisthenics Roadmap | ⚠️ UI Only | 5% |
| 2 | Sets and Reps Tracker | ⚠️ Partial | 30% |
| 3 | Progress Analyzer (AI) | ❌ Not Started | 0% |
| 4 | Daily Journal | ✅ Working | 85% |
| 5 | Form Checker | ❌ Not Started | 0% |
| 6 | Daily Streak | ⚠️ Partial | 40% |
| 7 | Exercise Library | ✅ Complete | 95% |
| 8 | AI Coach | ⚠️ UI Only | 5% |
| 9 | Workout Split Generator | ⚠️ Partial | 60% |

## 🗂️ Key Files
- `shared/schema.ts` - Database schema & types (Drizzle)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations
- `client/src/hooks/` - TanStack Query hooks
- `client/src/pages/` - Page components
- `logs/integration-status.md` - **Full status report**

## 🗄️ Database Setup
```bash
npm install
npx tsx database/setup.ts --seed  # Schema + Seed data
npx tsx database/setup.ts --reset # Drop all + reseed
npm run dev                        # Start server
# Visit http://localhost:5000
```

## 📊 API Endpoints Summary
### Auth
- `POST /api/login` | `POST /api/logout` | `GET /api/auth/user`

### User
- `GET /api/users/me` | `GET/PATCH /api/user/profile`

### Workouts
- `GET/POST /api/workouts` | `GET/PATCH/DELETE /api/workouts/:id`
- `POST /api/workouts/:id/exercises` | `DELETE /api/exercises/:id`

### Exercise Library
- `GET /api/exercises` | `GET /api/exercises/:slug`

### Templates
- `GET/POST /api/workout-templates` | `GET/PUT/DELETE /api/workout-templates/:id`
- `POST /api/workout-templates/:id/duplicate` | `POST /api/workout-templates/:id/start`

### Journal & Records
- `GET/POST /api/journal` | `PATCH /api/journal/:id`
- `GET/POST /api/records` | `GET /api/stats/weekly-volume`

## 🎯 Page Status
| Page | Route | Status | Backend |
|------|-------|--------|---------|
| Landing | `/` | ✅ 100% | N/A |
| Home | `/home` | ⚠️ 65% | Partial |
| Profile | `/profile` | ✅ 90% | Yes |
| Workout | `/workout` | ⚠️ 15% | **NO** |
| Exercises | `/exercises` | ✅ 95% | Yes |
| Templates | `/templates` | ✅ 90% | Yes |
| Journal | `/journal` | ✅ 90% | Yes |
| Roadmap | `/roadmap` | ⚠️ 10% | **NO** |
| Coach | `/coach` | ⚠️ 5% | **NO** |

## 📝 Priority Tasks
1. **HIGH:** Connect Workout page to backend
2. **HIGH:** Implement Workout Splits (weekly schedules)
3. **HIGH:** Add Roadmap backend progress tracking
4. **MEDIUM:** Streak calendar UI
5. **MEDIUM:** AI Coach integration

## 🚨 Troubleshooting
- Reset DB: `npx tsx database/setup.ts --reset`
- Check schema: `npx tsx database/utils.ts tables`
- Clear browser: cookies, localStorage
- Check `.env` for DATABASE_URL

## 📁 Project Structure
```
├── client/src/
│   ├── pages/        # 10 pages
│   ├── components/   # UI components
│   └── hooks/        # 8 React Query hooks
├── server/           # Express + API
├── database/         # Schema, seed, utils
├── shared/           # Drizzle schema
└── logs/             # Status reports
```

## 📚 Must-Read Files
1. `agent.md` (this file)
2. `logs/integration-status.md` ⭐ **Detailed status**
3. `shared/schema.ts`
4. `server/routes.ts`
5. `database/schema.sql`

**Version 5.0 - Nov 29, 2025**