import { Pool } from 'pg';
// pools will use environment variables
// for connection information
export default function createPostgresClient(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL
  })
}