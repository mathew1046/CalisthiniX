import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const queryClient = postgres(process.env.DATABASE_URL!);

async function createTable() {
  try {
    console.log("Creating journal_entries table...");
    await queryClient`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        energy_level INTEGER NOT NULL,
        mood INTEGER NOT NULL,
        notes TEXT,
        photo_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("Table created.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

createTable();