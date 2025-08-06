const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json()); // <-- ADD this line

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// New API routes for "workflows"
app.get('/api/workflows', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workflows ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/api/workflows', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Name is required');

  try {
    const result = await pool.query(
      'INSERT INTO workflows (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating workflow');
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
