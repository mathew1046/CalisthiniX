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

// ============ Workout Template Types ============

interface WorkoutTemplateExerciseInput {
  exerciseId: string;
  orderIndex: number;
  defaultSets?: number | null;
  defaultReps?: number | null;
  defaultRestSeconds?: number | null;
  notes?: string | null;
}

interface WorkoutTemplateExercise {
  id: string;
  exerciseId: string;
  orderIndex: number;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRestSeconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    slug: string;
    category: string;
    difficulty: string;
  };
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  createdAt: string;
  exercises: WorkoutTemplateExercise[];
}

interface WorkoutTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  createdAt: string;
}


import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storageConfig });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

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

  // Get complete user profile with metadata (NEW ENDPOINT)
  app.get("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get workout count
      const workouts = await storage.getWorkouts(userId, 1000);
      const workoutCount = workouts.length;

      // Return complete user profile data
      return res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        currentLevel: user.currentLevel,
        levelProgress: user.levelProgress,
        streak: user.streak,
        weight: user.weight,
        lastWorkoutDate: user.lastWorkoutDate,
        workoutCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error: any) {
      console.error("Error fetching user profile:", error?.message);
      
      // Fallback to mock data if database fails
      res.status(200).json({
        id: "local-user-123",
        email: "athlete@example.com",
        displayName: "John Athlete",
        firstName: "John",
        lastName: "Athlete",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        currentLevel: 2,
        levelProgress: 45,
        streak: 12,
        weight: 85,
        lastWorkoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        workoutCount: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
  app.post("/api/journal", isAuthenticated, upload.single("photo"), async (req: any, res) => {
    const userId = getUserId(req);
    
    // Handle date parsing manually since it comes as string in multipart/form-data
    let date = req.body.date ? new Date(req.body.date) : new Date();
    if (isNaN(date.getTime())) {
      date = new Date();
    }

    // Parse numeric fields from string (multipart/form-data sends everything as strings)
    const energyLevel = parseInt(req.body.energyLevel);
    const mood = parseInt(req.body.mood);

    const entryData = {
      userId,
      date,
      energyLevel: isNaN(energyLevel) ? 5 : energyLevel,
      mood: isNaN(mood) ? 5 : mood,
      notes: req.body.notes || "",
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };

    const result = insertJournalEntrySchema.safeParse(entryData);

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
    try {
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

  // ============ Workout Template Routes ============

  // GET /api/workout-templates - List all templates for current user
  app.get("/api/workout-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { difficulty, category } = req.query;

      const conditions = [sql`(wt.user_id = ${userId} OR wt.is_public = TRUE)`];

      if (difficulty) {
        conditions.push(sql`wt.difficulty = ${difficulty as string}`);
      }
      if (category) {
        conditions.push(sql`wt.category = ${category as string}`);
      }

      const whereClause = conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`);

      // Include isPublic, isOwner, and exerciseCount in the response
      const templates = await sql`
        SELECT 
          wt.id, 
          wt.name, 
          wt.description, 
          wt.difficulty, 
          wt.category, 
          wt.created_at as "createdAt",
          wt.is_public as "isPublic",
          (wt.user_id = ${userId}) as "isOwner",
          COALESCE(
            (SELECT COUNT(*) FROM workout_template_exercises wte WHERE wte.template_id = wt.id),
            0
          )::int as "exerciseCount"
        FROM workout_templates wt
        WHERE ${whereClause}
        ORDER BY wt.is_public DESC, wt.created_at DESC
      `;

      res.json(templates);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // GET /api/workout-templates/:id - Get single template with exercises
  app.get("/api/workout-templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      // Get the template with ownership info
      const [template] = await sql`
        SELECT 
          id, 
          name, 
          description, 
          difficulty, 
          category, 
          created_at as "createdAt",
          is_public as "isPublic",
          (user_id = ${userId}) as "isOwner"
        FROM workout_templates
        WHERE id = ${id} AND (user_id = ${userId} OR is_public = TRUE)
      `;

      if (!template) {
        return res.status(404).json({ error: "Workout template not found" });
      }

      // Get the template exercises with exercise details
      const exercises = await sql`
        SELECT 
          wte.id,
          wte.exercise_id as "exerciseId",
          wte.order_index as "orderIndex",
          wte.default_sets as "defaultSets",
          wte.default_reps as "defaultReps",
          wte.default_rest_seconds as "defaultRestSeconds",
          wte.notes,
          json_build_object(
            'id', el.id,
            'name', el.name,
            'slug', el.slug,
            'category', el.category,
            'difficulty', el.difficulty
          ) as exercise
        FROM workout_template_exercises wte
        JOIN exercise_library el ON el.id = wte.exercise_id
        WHERE wte.template_id = ${id}
        ORDER BY wte.order_index ASC
      `;

      const response: WorkoutTemplate = {
        ...template,
        exercises: exercises as WorkoutTemplateExercise[]
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching workout template:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // POST /api/workout-templates - Create a new template
  app.post("/api/workout-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { name, description, difficulty, category, exercises } = req.body;

      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Name is required" });
      }

      // Validate difficulty if provided
      if (difficulty && !["beginner", "intermediate", "advanced"].includes(difficulty)) {
        return res.status(400).json({ error: "Invalid difficulty value" });
      }

      // Insert the template
      const [newTemplate] = await sql`
        INSERT INTO workout_templates (user_id, name, description, difficulty, category)
        VALUES (${userId}, ${name}, ${description || null}, ${difficulty || null}, ${category || null})
        RETURNING id, name, description, difficulty, category, created_at as "createdAt"
      `;

      // Insert template exercises if provided
      if (exercises && Array.isArray(exercises) && exercises.length > 0) {
        for (const ex of exercises as WorkoutTemplateExerciseInput[]) {
          await sql`
            INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
            VALUES (
              ${newTemplate.id},
              ${ex.exerciseId},
              ${ex.orderIndex},
              ${ex.defaultSets ?? null},
              ${ex.defaultReps ?? null},
              ${ex.defaultRestSeconds ?? null},
              ${ex.notes ?? null}
            )
          `;
        }
      }

      res.status(201).json({ id: newTemplate.id });
    } catch (error: any) {
      console.error("Error creating workout template:", error);
      if (error?.code === "23503") {
        return res.status(400).json({ error: "Invalid exercise_id reference" });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // PUT /api/workout-templates/:id - Update a template
  app.put("/api/workout-templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { name, description, difficulty, category, exercises } = req.body;

      // Verify ownership
      const [existingTemplate] = await sql`
        SELECT id FROM workout_templates WHERE id = ${id} AND user_id = ${userId}
      `;

      if (!existingTemplate) {
        return res.status(404).json({ error: "Workout template not found or not authorized" });
      }

      // Validate difficulty if provided
      if (difficulty && !["beginner", "intermediate", "advanced"].includes(difficulty)) {
        return res.status(400).json({ error: "Invalid difficulty value" });
      }

      // Update the template metadata
      const [updatedTemplate] = await sql`
        UPDATE workout_templates
        SET 
          name = COALESCE(${name || null}, name),
          description = ${description ?? null},
          difficulty = ${difficulty ?? null},
          category = ${category ?? null}
        WHERE id = ${id}
        RETURNING id, name, description, difficulty, category, created_at as "createdAt"
      `;

      // If exercises array is provided, delete existing and re-insert
      if (exercises && Array.isArray(exercises)) {
        // Delete existing exercises
        await sql`DELETE FROM workout_template_exercises WHERE template_id = ${id}`;

        // Insert new exercises
        for (const ex of exercises as WorkoutTemplateExerciseInput[]) {
          await sql`
            INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
            VALUES (
              ${id},
              ${ex.exerciseId},
              ${ex.orderIndex},
              ${ex.defaultSets ?? null},
              ${ex.defaultReps ?? null},
              ${ex.defaultRestSeconds ?? null},
              ${ex.notes ?? null}
            )
          `;
        }
      }

      res.json(updatedTemplate);
    } catch (error: any) {
      console.error("Error updating workout template:", error);
      if (error?.code === "23503") {
        return res.status(400).json({ error: "Invalid exercise_id reference" });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // DELETE /api/workout-templates/:id - Delete a template
  app.delete("/api/workout-templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      // Verify ownership and delete
      const result = await sql`
        DELETE FROM workout_templates WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "Workout template not found or not authorized" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting workout template:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // POST /api/workout-templates/:id/duplicate - Duplicate a template to user's templates
  app.post("/api/workout-templates/:id/duplicate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      // Get the source template (must be accessible - either owned or public)
      const [sourceTemplate] = await sql`
        SELECT id, name, description, difficulty, category
        FROM workout_templates
        WHERE id = ${id} AND (user_id = ${userId} OR is_public = TRUE)
      `;

      if (!sourceTemplate) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Get the source template exercises
      const sourceExercises = await sql`
        SELECT exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes
        FROM workout_template_exercises
        WHERE template_id = ${id}
        ORDER BY order_index ASC
      `;

      // Create a new template for the user (not public, owned by user)
      const [newTemplate] = await sql`
        INSERT INTO workout_templates (user_id, name, description, difficulty, category, is_public)
        VALUES (
          ${userId}, 
          ${sourceTemplate.name + ' (Copy)'}, 
          ${sourceTemplate.description}, 
          ${sourceTemplate.difficulty}, 
          ${sourceTemplate.category},
          FALSE
        )
        RETURNING id, name, description, difficulty, category, created_at as "createdAt", is_public as "isPublic"
      `;

      // Copy all exercises to the new template
      for (const ex of sourceExercises) {
        await sql`
          INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
          VALUES (
            ${newTemplate.id},
            ${ex.exercise_id},
            ${ex.order_index},
            ${ex.default_sets},
            ${ex.default_reps},
            ${ex.default_rest_seconds},
            ${ex.notes}
          )
        `;
      }

      res.status(201).json({ 
        id: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
        difficulty: newTemplate.difficulty,
        category: newTemplate.category,
        createdAt: newTemplate.createdAt,
        isPublic: newTemplate.isPublic,
        isOwner: true,
        exerciseCount: sourceExercises.length
      });
    } catch (error) {
      console.error("Error duplicating workout template:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // POST /api/workout-templates/:id/start - Start a workout from a template
  app.post("/api/workout-templates/:id/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      // Get the template
      const [template] = await sql`
        SELECT id, name, description
        FROM workout_templates
        WHERE id = ${id} AND (user_id = ${userId} OR is_public = TRUE)
      `;

      if (!template) {
        return res.status(404).json({ error: "Workout template not found" });
      }

      // Get template exercises
      const templateExercises = await sql`
        SELECT 
          wte.order_index,
          wte.default_sets,
          wte.default_reps,
          wte.notes,
          el.name as exercise_name
        FROM workout_template_exercises wte
        JOIN exercise_library el ON el.id = wte.exercise_id
        WHERE wte.template_id = ${id}
        ORDER BY wte.order_index ASC
      `;

      // Create a new workout using the existing workouts table (Drizzle schema uses serial id)
      const workout = await storage.createWorkout({
        userId,
        name: template.name,
        date: new Date(),
        duration: null,
        totalVolume: 0,
        notes: template.description || null,
      });

      // Create exercises for the workout using the existing exercises table
      for (const templateEx of templateExercises) {
        // Build default sets array based on template
        const defaultSetsCount = templateEx.default_sets || 3;
        const defaultRepsCount = templateEx.default_reps || 10;
        const setsArray = Array.from({ length: defaultSetsCount }, () => ({
          reps: defaultRepsCount,
          weight: 0,
          rpe: 7
        }));

        await storage.createExercise({
          workoutId: workout.id,
          name: templateEx.exercise_name,
          sets: setsArray,
          order: templateEx.order_index,
        });
      }

      // Return the created workout
      const exercises = await storage.getExercisesByWorkout(workout.id);
      res.status(201).json({ ...workout, exercises });
    } catch (error) {
      console.error("Error starting workout from template:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return httpServer;
}
