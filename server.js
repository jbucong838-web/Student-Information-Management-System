const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static('public')); // Serve frontend files from 'public' folder

// GET /students - Retrieve all students
app.get('/students', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return res.json([]);
      }
      return res.status(500).json({ error: 'Failed to read data' });
    }
    res.json(JSON.parse(data));
  });
});

// POST /students - Add a new student
app.post('/students', (req, res) => {
  const newStudent = req.body; // Expect student object in the body
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Failed to read data' });
    }

    const students = err ? [] : JSON.parse(data); // If file doesn't exist, start with empty array
    students.push(newStudent); // Add the new student

    fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to save data' });
      }
      res.status(201).json({ message: 'Student added successfully', student: newStudent });
    });
  });
});

// DELETE /students/:id - Delete a student by ID (Optional bonus feature)
app.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') {
      return res.status(404).json({ error: 'No students found' });
    }
    if (err) {
      return res.status(500).json({ error: 'Failed to read data' });
    }

    let students = JSON.parse(data);
    const initialLength = students.length;
    students = students.filter(student => student.id !== studentId); // Filter by ID

    if (students.length === initialLength) {
      return res.status(404).json({ error: 'Student not found' });
    }

    fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to save data' });
      }
      res.json({ message: 'Student deleted successfully' });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});