import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '.pgdata');
const port = Number(process.env.PG_PORT || 5432);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'password',
  port,
  persistent: true,
});

async function main() {
  console.log(`[db:local] Initializing embedded PostgreSQL in ${dataDir} on port ${port}...`);
  try {
    await pg.initialise();
  } catch {
    // Already initialized
  }
  await pg.start();
  try {
    await pg.createDatabase('squadup');
  } catch {
    // Already exists
  }

  const dbUrl = `postgresql://postgres:password@localhost:${port}/squadup?schema=public`;
  console.log(`[db:local] Pushing Prisma schema to ${dbUrl}...`);
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  console.log(`[db:local] PostgreSQL ready at ${dbUrl}. Press Ctrl+C to stop.`);
  const shutdown = async () => {
    console.log('\n[db:local] Stopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[db:local] Failed:', err);
  process.exit(1);
});
