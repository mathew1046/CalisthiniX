import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config"; // Ensure env vars are loaded
import { 
  users, 
  workouts, 
  exercises, 
  journalEntries, 
  personalRecords,
  type User, 
  type UpsertUser,
  type UpdateUserProfile,
  type Workout,
  type InsertWorkout,
  type Exercise,
  type InsertExercise,
  type JournalEntry,
  type InsertJournalEntry,
  type PersonalRecord,
  type InsertPersonalRecord
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

let queryClient: any;
let db: any;

try {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not defined. Using default postgres connection (may fail).");
  }
  queryClient = postgres(process.env.DATABASE_URL!);
  db = drizzle(queryClient);
} catch (error) {
  console.error("Database connection error:", error);
}

export interface IStorage {
  // Users (Replit Auth required methods)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined>;
  updateUserStreak(userId: string, streak: number, lastWorkoutDate: Date): Promise<void>;

  // Workouts
  getWorkouts(userId: string, limit?: number): Promise<Workout[]>;
  getWorkout(workoutId: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(workoutId: number, updates: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(workoutId: number): Promise<void>;

  // Exercises
  getExercisesByWorkout(workoutId: number): Promise<Exercise[]>;
  getExercise(exerciseId: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(exerciseId: number, updates: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(exerciseId: number): Promise<void>;

  // Journal
  getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  getJournalEntryByDate(userId: string, date: Date): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(entryId: number, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;

  // Personal Records
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;
}

export class DatabaseStorage implements IStorage {
  // Users (Replit Auth required methods)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        displayName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData.firstName || userData.lastName || 'Athlete',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStreak(userId: string, streak: number, lastWorkoutDate: Date): Promise<void> {
    await db.update(users)
      .set({ streak, lastWorkoutDate })
      .where(eq(users.id, userId));
  }

  // Workouts
  async getWorkouts(userId: string, limit: number = 50): Promise<Workout[]> {
    return db.select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.date))
      .limit(limit);
  }

  async getWorkout(workoutId: number): Promise<Workout | undefined> {
    const [workout] = await db.select()
      .from(workouts)
      .where(eq(workouts.id, workoutId))
      .limit(1);
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async updateWorkout(workoutId: number, updates: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const [workout] = await db.update(workouts)
      .set(updates)
      .where(eq(workouts.id, workoutId))
      .returning();
    return workout;
  }

  async deleteWorkout(workoutId: number): Promise<void> {
    // First delete associated exercises
    await db.delete(exercises).where(eq(exercises.workoutId, workoutId));
    // Then delete the workout
    await db.delete(workouts).where(eq(workouts.id, workoutId));
  }

  // Exercises
  async getExercisesByWorkout(workoutId: number): Promise<Exercise[]> {
    return db.select()
      .from(exercises)
      .where(eq(exercises.workoutId, workoutId))
      .orderBy(exercises.order);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises).values(exercise).returning();
    return newExercise;
  }

  async updateExercise(exerciseId: number, updates: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const [exercise] = await db.update(exercises)
      .set(updates)
      .where(eq(exercises.id, exerciseId))
      .returning();
    return exercise;
  }

  async getExercise(exerciseId: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select()
      .from(exercises)
      .where(eq(exercises.id, exerciseId))
      .limit(1);
    return exercise;
  }

  async deleteExercise(exerciseId: number): Promise<void> {
    await db.delete(exercises).where(eq(exercises.id, exerciseId));
  }

  // Journal
  async getJournalEntries(userId: string, limit: number = 30): Promise<JournalEntry[]> {
    return db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date))
      .limit(limit);
  }

  async getJournalEntryByDate(userId: string, date: Date): Promise<JournalEntry | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entry] = await db.select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.date, startOfDay),
          lte(journalEntries.date, endOfDay)
        )
      )
      .limit(1);
    return entry;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async updateJournalEntry(entryId: number, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [entry] = await db.update(journalEntries)
      .set(updates)
      .where(eq(journalEntries.id, entryId))
      .returning();
    return entry;
  }

  // Personal Records
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return db.select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, userId))
      .orderBy(desc(personalRecords.achievedAt))
      .limit(10);
  }

  async createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord> {
    const [newRecord] = await db.insert(personalRecords).values(record).returning();
    return newRecord;
  }
}

export const storage = new DatabaseStorage();
