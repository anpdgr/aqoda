import { Pool } from 'pg';
// pools will use environment variables
// for connection information
export default function createPostgresClient(): Pool {
  return new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'aqoda',
    password: 'password',
    port: 5432,
  })
}