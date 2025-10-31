document.addEventListener("DOMContentLoaded", () => {
  const addStudentBtn = document.getElementById("add-student-btn");
  const studentListBtn = document.getElementById("student-list-btn");
  const addSection = document.getElementById("add-student-section");
  const listSection = document.getElementById("student-list-section");
  const tableBody = document.getElementById("studentTable");
  const form = document.getElementById("studentForm");
  const searchInput = document.getElementById("search");
  const genderFilter = document.getElementById("genderFilter");
  const studentCount = document.getElementById("studentCount");

  let students = [];

  const API_URL = "http://localhost:3000/students"; // <-- Connect to backend

  // ====== Navigation Toggle ======
  addStudentBtn.addEventListener("click", () => {
    addSection.classList.remove("hidden");
    listSection.classList.add("hidden");
    addStudentBtn.classList.add("active");
    studentListBtn.classList.remove("active");
  });

  studentListBtn.addEventListener("click", () => {
    addSection.classList.add("hidden");
    listSection.classList.remove("hidden");
    addStudentBtn.classList.remove("active");
    studentListBtn.classList.add("active");
    loadStudents();
  });

  // ====== Fetch and Display Students from Backend ======
  async function loadStudents() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Normalize keys (for old data with capitalized field names)
      students = data.map((s) => ({
        studentId: s["Student ID"] || s.studentId,
        fullName: s["Full Name"] || s.fullName,
        gender: s["Gender"] || s.gender,
        gmail: s["Gmail"] || s.gmail,
        program: s["Program"] || s.program,
        yearLevel: s["Year Level"] || s.yearLevel,
        university: s["University"] || s.university,
      }));

      // Filter out empty or invalid records
      students = students.filter(
        (s) =>
          s.studentId &&
          s.fullName &&
          s.gender &&
          s.gmail &&
          s.program &&
          s.yearLevel &&
          s.university
      );

      displayStudents(students);
    } catch (err) {
      console.error("Error loading students:", err);
      alert("❌ Failed to load student list. Make sure the server is running.");
    }
  }

  // ====== Display Students ======
  function displayStudents(data) {
    let filtered = data;

    const selectedGender = genderFilter.value;
    if (selectedGender !== "All") {
      filtered = filtered.filter((s) => s.gender === selectedGender);
    }

    const searchText = searchInput.value.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.studentId.toLowerCase().includes(searchText) ||
        s.fullName.toLowerCase().includes(searchText) ||
        s.program.toLowerCase().includes(searchText) ||
        s.university.toLowerCase().includes(searchText)
    );

    filtered = filtered.slice(0, 50);

    studentCount.textContent = `Showing ${filtered.length} student(s) found`;
    tableBody.innerHTML = "";

    filtered.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.studentId}</td>
        <td>${student.fullName}</td>
        <td>${student.gender}</td>
        <td>${student.gmail}</td>
        <td>${student.program}</td>
        <td>${student.yearLevel}</td>
        <td>${student.university}</td>
        <td><button class="delete-btn" data-id="${student.studentId}">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });

    // Delete button handler
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await deleteStudent(id);
        loadStudents();
      });
    });
  }

  // ====== Add Listeners ======
  searchInput.addEventListener("input", () => displayStudents(students));
  genderFilter.addEventListener("change", () => displayStudents(students));

  // ====== Add New Student ======
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newStudent = {
      studentId: document.getElementById("studentId").value,
      fullName: document.getElementById("fullName").value,
      gender: document.getElementById("gender").value,
      gmail: document.getElementById("gmail").value,
      program: document.getElementById("program").value,
      yearLevel: document.getElementById("yearLevel").value,
      university: document.getElementById("university").value,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Student added successfully!");
        form.reset();

        // Switch to Student List view automatically
        addSection.classList.add("hidden");
        listSection.classList.remove("hidden");
        addStudentBtn.classList.remove("active");
        studentListBtn.classList.add("active");

        // Reload the student list
        await loadStudents();
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Error adding student:", err);
      alert("❌ Could not connect to server.");
    }
  });

  // ====== Delete Student ======
  async function deleteStudent(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert("🗑️ " + data.message);
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("❌ Failed to delete student.");
    }
  }
});


