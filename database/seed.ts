import postgres from "postgres";
import { users, workouts, exercises, journalEntries, personalRecords } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";

dotenv.config();

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient);

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data (optional - comment out if you want to keep data)
    // await queryClient`DELETE FROM exercises`;
    // await queryClient`DELETE FROM workouts`;
    // await queryClient`DELETE FROM users`;

    // Insert dummy user
    console.log("📝 Inserting user...");
    const [user] = await db
      .insert(users)
      .values({
        id: "local-user-123",
        email: "athlete@example.com",
        firstName: "John",
        lastName: "Athlete",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        displayName: "John Athlete",
        currentLevel: 2,
        levelProgress: 45,
        streak: 12,
        weight: 85, // kg
        lastWorkoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          displayName: "John Athlete",
          currentLevel: 2,
          levelProgress: 45,
          streak: 12,
          weight: 85,
          lastWorkoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      })
      .returning();

    console.log(`✓ User created: ${user.displayName}\n`);

    // Insert dummy workouts
    console.log("💪 Inserting workouts...");
    const workoutDates = [
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    ];

    const insertedWorkouts = await db
      .insert(workouts)
      .values(
        workoutDates.map((date, i) => ({
          userId: user.id,
          name: ["Push Day A", "Pull Day B", "Legs Day A", "Push Day B", "Pull Day A", "Legs Day B"][i],
          date,
          duration: Math.floor(45 + Math.random() * 30),
          totalVolume: Math.floor(5000 + Math.random() * 5000),
          notes: ["Great session!", "Could do better", "Feeling strong", "Good pump", "Solid day", "Excellent work"][i],
        }))
      )
      .returning();

    console.log(`✓ ${insertedWorkouts.length} workouts created\n`);

    // Insert exercises for the first workout
    console.log("🏋️ Inserting exercises...");
    const exerciseData = [
      { name: "Push-ups", sets: [{ reps: 20, weight: undefined, rpe: 7 }, { reps: 18, weight: undefined, rpe: 8 }, { reps: 15, weight: undefined, rpe: 9 }] },
      { name: "Dips", sets: [{ reps: 12, weight: undefined, rpe: 7 }, { reps: 10, weight: undefined, rpe: 8 }] },
      { name: "Handstand Hold", sets: [{ reps: 1, weight: undefined, rpe: 8 }] },
    ];

    for (let i = 0; i < exerciseData.length; i++) {
      await db
        .insert(exercises)
        .values({
          workoutId: insertedWorkouts[0].id,
          name: exerciseData[i].name,
          sets: exerciseData[i].sets,
          order: i,
        })
        .returning();
    }

    console.log("✓ Exercises created\n");

    // Insert journal entries
    console.log("📔 Inserting journal entries...");
    const journalData = [
      { notes: "Great workout today!", photoUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60" },
      { notes: "Feeling tired but did my best", photoUrl: null },
      { notes: "Excellent session with PRs", photoUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&auto=format&fit=crop&q=60" },
      { notes: "Recovery day", photoUrl: null },
      { notes: "Amazing pump!", photoUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60" }
    ];

    for (let i = 0; i < 5; i++) {
      await db
        .insert(journalEntries)
        .values({
          userId: user.id,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          energyLevel: Math.floor(1 + Math.random() * 9),
          mood: Math.floor(1 + Math.random() * 9),
          notes: journalData[i].notes,
          photoUrl: journalData[i].photoUrl,
        })
        .returning();
    }

    console.log("✓ Journal entries created\n");

    // Insert personal records
    console.log("🏆 Inserting personal records...");
    const prData = [
      { exerciseName: "Pull-ups", value: "15 reps" },
      { exerciseName: "Muscle-ups", value: "3 reps" },
      { exerciseName: "Handstand Hold", value: "45 seconds" },
      { exerciseName: "L-Sit Hold", value: "20 seconds" },
    ];

    for (const pr of prData) {
      await db
        .insert(personalRecords)
        .values({
          userId: user.id,
          exerciseName: pr.exerciseName,
          value: pr.value,
          achievedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        })
        .returning();
    }

    console.log("✓ Personal records created\n");

    console.log("✅ Database seeding completed successfully!\n");
    console.log("📊 Seeded data summary:");
    console.log(`   - Users: 1 (ID: ${user.id})`);
    console.log(`   - Workouts: ${insertedWorkouts.length}`);
    console.log(`   - Exercises: ${exerciseData.length}`);
    console.log(`   - Journal Entries: 5`);
    console.log(`   - Personal Records: ${prData.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
