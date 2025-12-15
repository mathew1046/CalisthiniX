import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, index, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: text("display_name"),
  currentLevel: integer("current_level").notNull().default(0),
  levelProgress: integer("level_progress").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastWorkoutDate: timestamp("last_workout_date"),
  weight: integer("weight"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  duration: integer("duration"),
  durationSeconds: integer("duration_seconds"),
  totalVolume: integer("total_volume").notNull().default(0),
  status: text("status").default("in_progress"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  name: text("name").notNull(),
  sets: jsonb("sets").notNull().$type<Array<{ reps: number; weight?: number; rpe: number; completed: boolean }>>(),
  order: integer("order").notNull().default(0),
});

export const exerciseLibrary = pgTable("exercise_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  category: text("category"), // 'push', 'pull', 'legs', 'core', 'skill'
  difficulty: text("difficulty"), // 'beginner', 'intermediate', 'advanced'
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  progressions: jsonb("progressions").default([]),
  regressions: jsonb("regressions").default([]),
  musclesPrimary: text("muscles_primary").array(),
  musclesSecondary: text("muscles_secondary").array(),
  equipment: text("equipment").array(),
  demoImageUrl: text("demo_image_url"),
  demoGifUrl: text("demo_gif_url"),
  tips: text("tips").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_exercise_library_name").on(table.name),
  index("idx_exercise_library_category").on(table.category),
  index("idx_exercise_library_difficulty").on(table.difficulty),
]);

export const workoutTemplates = pgTable("workout_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  difficulty: text("difficulty"), // 'beginner', 'intermediate', 'advanced'
  category: text("category"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_workout_templates_user_id").on(table.userId),
]);

export const workoutTemplateExercises = pgTable("workout_template_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => workoutTemplates.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exerciseLibrary.id),
  orderIndex: integer("order_index").notNull(),
  defaultSets: integer("default_sets"),
  defaultReps: integer("default_reps"),
  defaultRestSeconds: integer("default_rest_seconds"),
  notes: text("notes"),
}, (table) => [
  index("idx_workout_template_exercises_template_id").on(table.templateId),
]);

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  energyLevel: integer("energy_level").notNull(),
  mood: integer("mood").notNull(),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseName: text("exercise_name").notNull(),
  value: text("value").notNull(),
  achievedAt: timestamp("achieved_at").notNull().defaultNow(),
});

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({
  id: true,
});

// Update schemas for user profile
export const updateUserProfileSchema = z.object({
  displayName: z.string().optional(),
  weight: z.number().optional(),
  currentLevel: z.number().optional(),
  levelProgress: z.number().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
