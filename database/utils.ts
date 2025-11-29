/**
 * CalistheniX - Database Utilities
 * 
 * Usage:
 *   npx tsx database/utils.ts check <table_name>     # Check columns of a table
 *   npx tsx database/utils.ts tables                 # List all tables
 *   npx tsx database/utils.ts counts                 # Count records in all tables
 *   npx tsx database/utils.ts drop <table_name>      # Drop a specific table
 */

import 'dotenv/config';
import postgres from 'postgres';

const command = process.argv[2];
const argument = process.argv[3];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    switch (command) {
      case 'check':
        if (!argument) {
          console.log('Usage: npx tsx database/utils.ts check <table_name>');
          break;
        }
        const columns = await sql`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = ${argument}
          ORDER BY ordinal_position
        `;
        console.log(`\n📋 Columns in "${argument}":\n`);
        columns.forEach((c: any) => {
          console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
        });
        break;

      case 'tables':
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        console.log('\n📋 Tables in database:\n');
        tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
        break;

      case 'counts':
        const allTables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        console.log('\n📊 Record counts:\n');
        for (const t of allTables) {
          const count = await sql.unsafe(`SELECT COUNT(*) as count FROM "${t.table_name}"`);
          console.log(`  ${t.table_name}: ${count[0].count}`);
        }
        break;

      case 'drop':
        if (!argument) {
          console.log('Usage: npx tsx database/utils.ts drop <table_name>');
          break;
        }
        console.log(`\n⚠️  Dropping table "${argument}"...`);
        await sql.unsafe(`DROP TABLE IF EXISTS "${argument}" CASCADE`);
        console.log(`✓ Table "${argument}" dropped\n`);
        break;

      default:
        console.log(`
CalistheniX Database Utilities

Commands:
  check <table>  - Show columns for a table
  tables         - List all tables
  counts         - Count records in all tables
  drop <table>   - Drop a specific table

Example:
  npx tsx database/utils.ts check users
  npx tsx database/utils.ts tables
        `);
    }
  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
