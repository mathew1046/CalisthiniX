import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const queryClient = postgres(process.env.DATABASE_URL!);

async function checkColumns() {
  const columns = await queryClient`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'journal_entries'
  `;
  console.log(columns);
  process.exit(0);
}

checkColumns();