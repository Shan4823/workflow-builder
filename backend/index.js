const express = require('express');
const pool = require('./db');
const app = express();

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
