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

app.put('/api/workflows/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).send('Name is required');
  try {
    const result = await pool.query(
      'UPDATE workflows SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Workflow not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating workflow');
  }
});

app.delete('/api/workflows/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM workflows WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Workflow not found');
    res.json({ message: 'Workflow deleted', workflow: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting workflow');
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));
