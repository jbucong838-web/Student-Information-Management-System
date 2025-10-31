const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = "students.json";

let students = [];
if (fs.existsSync(DATA_FILE)) {
  students = JSON.parse(fs.readFileSync(DATA_FILE));
}

//  ======= GET ALL STUDENTS =======
app.get("/students", (req, res) => {
  res.json(students);
});

// ========= POST ADD STUDENT ========
app.post("/students", (req, res) => {
  const { studentId, fullName, gender, gmail, program, yearLevel, university } = req.body;

  if (!studentId || !fullName || !gender || !gmail || !program || !yearLevel || !university) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  if (!gmail.includes("@")) {
    return res.status(400).json({ error: "Invalid Gmail format!" });
  }

  if (students.find((s) => s.studentId === studentId)) {
    return res.status(400).json({ error: "Student ID already exists!" });
  }

  const newStudent = { studentId, fullName, gender, gmail, program, yearLevel, university };
  students.push(newStudent);
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
  res.status(201).json({ message: "Student added successfully!" });
});

// ======== DELETE STUDENTS ========
app.delete("/students/:id", (req, res) => {
  const id = req.params.id;
  students = students.filter((s) => s.studentId !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
  res.json({ message: "Student deleted successfully!" });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
