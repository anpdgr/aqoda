const { Pool } = require('pg')
// pools will use environment variables
// for connection information
function createClient() {
  return new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'aqoda',
    password: 'password',
    port: 5432,
  })
}

module.exports = createClient;