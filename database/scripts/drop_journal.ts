import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const queryClient = postgres(process.env.DATABASE_URL!);

async function dropTable() {
  try {
    console.log("Dropping journal_entries table...");
    await queryClient`DROP TABLE IF EXISTS journal_entries CASCADE`;
    console.log("Table dropped.");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping table:", error);
    process.exit(1);
  }
}

dropTable();