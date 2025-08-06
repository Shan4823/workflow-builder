const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // Your postgres user (default is 'postgres')
  host: 'localhost',          // 'localhost' if running locally
  database: 'workflowbuilder',// Your database name from step 2
  password: '0000',  // The password you set during install
  port: 5432,                 // Default postgres port
});

module.exports = pool;
