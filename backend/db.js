// Load environment variables from .env file into process.env
require('dotenv').config();

const { Pool } = require('pg');

// Create a new Pool instance to manage PostgreSQL connections
const pool = new Pool({
  user: process.env.PGUSER,        // PostgreSQL user
  host: process.env.PGHOST,        // PostgreSQL server host, e.g. localhost
  database: process.env.PGDATABASE, // Database name
  password: process.env.PGPASSWORD, // User's password
  port: process.env.PGPORT || 5432, // Port number, default to 5432 if not set
});

// Optional: log when pool connects to help with debugging (comment out if needed)
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

// Optional: handle errors on the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;


