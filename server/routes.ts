import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sql } from "./db";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import {
  insertWorkoutSchema,
  insertExerciseSchema,
  insertJournalEntrySchema,
  insertPersonalRecordSchema,
  updateUserProfileSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Helper function to get userId from request (works with both local auth and replit auth)
function getUserId(req: any): string {
  // Local auth stores user.id directly
  // Replit auth would store user.claims.sub
  return req.user?.id || req.user?.claims?.sub || "";
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Local Auth (for development)
  setupLocalAuth(app);

  // Auth route - get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user profile
  app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  // Update user profile
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    const result = updateUserProfileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }

    const updatedUser = await storage.updateUserProfile(userId, result.data);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  });

  // Get all workouts
  app.get("/api/workouts", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const workouts = await storage.getWorkouts(userId, limit);
    res.json(workouts);
  });

  // Get single workout with exercises
  app.get("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const workoutId = parseInt(req.params.id);
    const workout = await storage.getWorkout(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (workout.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const exercises = await storage.getExercisesByWorkout(workoutId);
    res.json({ ...workout, exercises });
  });

  // Create workout
  app.post("/api/workouts", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    const result = insertWorkoutSchema.safeParse({
      ...req.body,
      userId,
    });

    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }

    const workout = await storage.createWorkout(result.data);

    // Update user streak
    const user = await storage.getUser(userId);
    if (user) {
      const today = new Date();
      const lastWorkout = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;

      let newStreak = user.streak;
      if (lastWorkout) {
        const daysSince = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince === 1) {
          newStreak += 1; // Consecutive day
        } else if (daysSince > 1) {
          newStreak = 1; // Streak broken, start new
        }
        // Same day workout doesn't change streak
      } else {
        newStreak = 1; // First workout
      }

      await storage.updateUserStreak(userId, newStreak, today);
    }

    res.status(201).json(workout);
  });

  // Update workout
  app.patch("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const workoutId = parseInt(req.params.id);
    const workout = await storage.getWorkout(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (workout.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedWorkout = await storage.updateWorkout(workoutId, req.body);
    res.json(updatedWorkout);
  });

  // Delete workout
  app.delete("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const workoutId = parseInt(req.params.id);
    const workout = await storage.getWorkout(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (workout.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await storage.deleteWorkout(workoutId);
    res.status(204).send();
  });

  // Add exercise to workout
  app.post("/api/workouts/:workoutId/exercises", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const workoutId = parseInt(req.params.workoutId);
    const workout = await storage.getWorkout(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (workout.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const result = insertExerciseSchema.safeParse({
      ...req.body,
      workoutId,
    });

    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }

    const exercise = await storage.createExercise(result.data);
    res.status(201).json(exercise);
  });

  // Delete exercise
  app.delete("/api/exercises/:id", isAuthenticated, async (req: any, res) => {
    const exerciseId = parseInt(req.params.id);
    await storage.deleteExercise(exerciseId);
    res.status(204).send();
  });

  // Get journal entries
  app.get("/api/journal", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
    const entries = await storage.getJournalEntries(userId, limit);
    res.json(entries);
  });

  // Create journal entry
  app.post("/api/journal", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const result = insertJournalEntrySchema.safeParse({
      ...req.body,
      userId,
    });

    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }

    const entry = await storage.createJournalEntry(result.data);
    res.status(201).json(entry);
  });

  // Update journal entry
  app.patch("/api/journal/:id", isAuthenticated, async (req: any, res) => {
    const entryId = parseInt(req.params.id);
    const updatedEntry = await storage.updateJournalEntry(entryId, req.body);

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(updatedEntry);
  });

  // Get personal records
  app.get("/api/records", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const records = await storage.getPersonalRecords(userId);
    res.json(records);
  });

  // Create personal record
  app.post("/api/records", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const result = insertPersonalRecordSchema.safeParse({
      ...req.body,
      userId,
    });

    if (!result.success) {
      return res.status(400).json({ error: fromZodError(result.error).message });
    }

    const record = await storage.createPersonalRecord(result.data);
    res.status(201).json(record);
  } catch (error: any) {
    console.error("Error creating personal record:", error?.message);
    res.status(500).json({ error: "Failed to create personal record" });
  }
});

// Get workout stats (for charts and analytics)
app.get("/api/stats/weekly-volume", isAuthenticated, async (req: any, res) => {
  const userId = getUserId(req);
  // Get last 7 days of workouts
  const workouts = await storage.getWorkouts(userId, 30);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  // Create array of last 7 days with volumes
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekAgo);
    date.setDate(weekAgo.getDate() + i);
    const dayName = days[date.getDay()];

    const dayWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === date.toDateString();
    });

    const totalVolume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);

    weeklyData.push({ day: dayName, volume: totalVolume });
  }

  res.json(weeklyData);
});

// Exercise Library Routes
app.get("/api/exercises", async (req, res) => {
  try {
    const { q, category, difficulty, limit = "50", offset = "0" } = req.query;

    const conditions = [];
    if (q) {
      conditions.push(sql`name ILIKE ${'%' + (q as string) + '%'}`);
    }
    if (category) {
      conditions.push(sql`category = ${category as string}`);
    }
    if (difficulty) {
      conditions.push(sql`difficulty = ${difficulty as string}`);
    }

    let whereClause = sql`TRUE`;
    if (conditions.length > 0) {
      whereClause = conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`);
    }

    const exercises = await sql`
        SELECT id, name, slug, category, difficulty, demo_image_url 
        FROM exercise_library
        WHERE ${whereClause}
        ORDER BY name ASC
        LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
      `;

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/exercises/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [exercise] = await sql`
        SELECT * FROM exercise_library WHERE slug = ${slug}
      `;

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

return httpServer;
}
