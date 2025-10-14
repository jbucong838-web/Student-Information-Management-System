document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const studentBody = document.getElementById('studentBody');

  // Function to fetch and display students
  async function fetchStudents() {
    try {
      const response = await fetch('http://localhost:3000/students');
      const students = await response.json();
      studentBody.innerHTML = ''; // Clear existing rows
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.fullName}</td>
          <td>${student.gender}</td>
          <td>${student.gmail}</td>
          <td>${student.program}</td>
          <td>${student.yearLevel}</td>
          <td>${student.university}</td>
          <td><button class="btn btn-danger btn-sm deleteBtn" data-id="${student.id}">Delete</button></td>
        `;
        studentBody.appendChild(row);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.getAttribute('data-id');
          await fetch(`http://localhost:3000/students/${id}`, { method: 'DELETE' });
          fetchStudents(); // Refresh the list
        });
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  // Initial fetch
  fetchStudents();

  // Form submission with validation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const student = {
      id: document.getElementById('studentId').value,
      fullName: document.getElementById('fullName').value,
      gender: document.getElementById('gender').value,
      gmail: document.getElementById('gmail').value,
      program: document.getElementById('program').value,
      yearLevel: document.getElementById('yearLevel').value,
      university: document.getElementById('university').value
    };

    // Input validation
    if (!student.id || !student.fullName || !student.gender || !student.gmail || !student.program || !student.university) {
      alert('All fields are required!');
      return;
    }
    if (isNaN(student.yearLevel) || student.yearLevel < 1) {
      alert('Year Level must be a number greater than or equal to 1!');
      return;
    }

    try {
      await fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      form.reset(); // Clear form
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  });

  // Search functionality
  searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    try {
      const response = await fetch('http://localhost:3000/students');
      const students = await response.json();
      const filteredStudents = students.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm) ||
        student.program.toLowerCase().includes(searchTerm) ||
        student.gender.toLowerCase().includes(searchTerm)
      );
      
      studentBody.innerHTML = ''; // Clear existing rows
      filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.fullName}</td>
          <td>${student.gender}</td>
          <td>${student.gmail}</td>
          <td>${student.program}</td>
          <td>${student.yearLevel}</td>
          <td>${student.university}</td>
          <td><button class="btn btn-danger btn-sm deleteBtn" data-id="${student.id}">Delete</button></td>
        `;
        studentBody.appendChild(row);
      });

      // Add event listeners for delete buttons in filtered list
      document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.getAttribute('data-id');
          await fetch(`http://localhost:3000/students/${id}`, { method: 'DELETE' });
          fetchStudents(); // Refresh the full list
        });
      });
    } catch (error) {
      console.error('Error searching students:', error);
    }
  });
});