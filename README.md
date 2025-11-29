# CalisthiniX

CalisthiniX is a comprehensive full-stack web application designed for calisthenics enthusiasts to track their workouts, monitor progress, and maintain a training journal. It combines powerful tracking features with a modern, responsive user interface to help users stay consistent and achieve their fitness goals.

## 🚀 Features

### 💪 Workout Tracking
- **Create & Manage Workouts**: Log detailed workout sessions including date, duration, and notes.
- **Exercise Logging**: Track exercises with precise details:
  - Sets, Reps, and Weight
  - RPE (Rate of Perceived Exertion)
  - Automatic volume calculation
- **History**: View past workouts and track your consistency.

### 📊 Analytics & Progress
- **Dashboard**: Get an at-a-glance view of your fitness journey.
- **Weekly Volume**: Visual charts (powered by Recharts) to monitor your training volume over the week.
- **Streak System**: Gamified streak counter to encourage daily activity and consistency.
- **Personal Records**: dedicated section to track and celebrate your PRs on different exercises.

### �️ Roadmap & Skills
- **Skill Progression**: Visual roadmap guiding you from Foundation to God Tier levels.
- **Skill Tree**: Track mastery of specific calisthenics skills (e.g., Muscle Up, Planche, Front Lever).
- **Level Requirements**: Clear criteria for advancing to the next difficulty level.

### 🤖 AI Coach
- **Smart Assistant**: Integrated chat interface for training advice and routine adjustments.
- **Personalized Tips**: Get suggestions based on your recent performance and volume.
- **Form & Routine Help**: Ask for form checks, split generation, or plateau-breaking strategies.

### �📝 Daily Journal
- **Mood & Energy**: Log daily mood and energy levels to correlate with training performance.
- **Notes**: Keep a personal training diary to reflect on sessions and recovery.

### 👤 User Profile
- **Leveling System**: Gamified experience with user levels and progress bars.
- **Stats**: Track body weight and other personal metrics.
- **Customization**: Update profile details and preferences.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v19) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth interactions
- **Routing**: [Wouter](https://github.com/molefrog/wouter) for lightweight routing
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/) for data visualization

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Authentication**: Passport.js / Replit Auth integration
- **API**: RESTful API endpoints

### Database
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Neon Serverless)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions
- **Schema Validation**: Drizzle-Zod for automatic schema validation

## 📂 Project Structure

```
CalisthiniX/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Application views/routes
│   │   └── ...
├── server/                 # Backend Express server
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database access layer
│   └── ...
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
└── ...
```

## ⚡ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure your database credentials are set up, then push the schema:
   ```bash
   npm run db:push
   ```

3. **Run Development Server**
   Start both the client and server in development mode:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`.

## 📜 Scripts

- `npm run dev`: Start the development server (client + server).
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run check`: Run TypeScript type checking.
- `npm run db:push`: Push Drizzle schema changes to the database.

## 📄 License

MIT
