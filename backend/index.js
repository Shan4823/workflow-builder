const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Your configured Postgres pool connection
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Optional: Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, serverTime: result.rows[0].now });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Get all workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workflows ORDER BY id');
    res.json({ success: true, workflows: result.rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Create new workflow
app.post('/api/workflows', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO workflows (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ success: true, workflow: result.rows[0] });
  } catch (err) {
    console.error('Error creating workflow:', err);
    res.status(500).json({ success: false, error: 'Error creating workflow' });
  }
});

// Update workflow by id
app.put('/api/workflows/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE workflows SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    res.json({ success: true, workflow: result.rows[0] });
  } catch (err) {
    console.error('Error updating workflow:', err);
    res.status(500).json({ success: false, error: 'Error updating workflow' });
  }
});

// Delete workflow by id
app.delete('/api/workflows/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM workflows WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    res.json({ success: true, message: 'Workflow deleted', workflow: result.rows[0] });
  } catch (err) {
    console.error('Error deleting workflow:', err);
    res.status(500).json({ success: false, error: 'Error deleting workflow' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
