// const API_URL = 'http://127.0.0.1:5000/problems';
const API_URL = 'https://problems-tracker.onrender.com/problems';
let currentFilter = 'all';
let allProblems = [];

// Fetch and display problems from backend
async function fetchProblems() {
  const res = await fetch(API_URL);
  allProblems = await res.json();
  displayProblems();
}

// Add a new problem
document.getElementById('problemForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const platform = document.getElementById('platform').value.trim();
  const tags = document.getElementById('tags').value.trim().split(',').map(tag => tag.trim());
  const notes = document.getElementById('notes').value.trim();

  const newProblem = {
    id: Date.now().toString(),
    title,
    platform,
    tags,
    notes,
    status: 'todo',
    date: new Date().toLocaleDateString()
  };

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProblem)
  });

  document.getElementById('problemForm').reset();
  fetchProblems();
});

// Display problems
function displayProblems() {
  const list = document.getElementById('problemList');
  list.innerHTML = '';

  const filtered = allProblems.filter(problem => {
    if (currentFilter === 'all') return true;
    return problem.status === currentFilter;
  });

  filtered.forEach(problem => {
    const card = document.createElement('div');
    card.className = 'problem-card';

    card.innerHTML = `
      <h3>${problem.title}</h3>
      <p><strong>Platform:</strong> ${problem.platform || '-'}</p>
      <p><strong>Tags:</strong> ${problem.tags.join(', ') || '-'}</p>
      <p><strong>Date:</strong> ${problem.date}</p>
      <p><strong>Notes:</strong><br>${problem.notes || '-'}</p>
      <span class="status ${problem.status}">${problem.status.toUpperCase()}</span>
      <div class="card-actions">
        <button onclick="markSolved('${problem.id}')">✅ Done</button>
        <button onclick="openEditModal('${problem.id}')">✏️ Edit</button>
        <button onclick="deleteProblem('${problem.id}')">🗑️ Delete</button>
    </div>
    `;

    list.appendChild(card);
  });
}

// Filter buttons
function filterProblems(status) {
  currentFilter = status;
  displayProblems();
}

// Mark as solved
async function markSolved(id) {
  const problem = allProblems.find(p => p.id === id);
  if (!problem || problem.status === 'solved') return;

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'solved',
      notes: problem.notes
    })
  });

  fetchProblems();
}

// Delete a problem
async function deleteProblem(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  fetchProblems();
}

// Search bar
function searchProblems() {
  const query = document.getElementById('searchBar').value.toLowerCase();
  const list = document.getElementById('problemList');
  list.innerHTML = '';

  const results = allProblems.filter(problem =>
    problem.title.toLowerCase().includes(query) ||
    problem.tags.some(tag => tag.toLowerCase().includes(query))
  );

  results.forEach(problem => {
    const card = document.createElement('div');
    card.className = 'problem-card';

    card.innerHTML = `
      <h3>${problem.title}</h3>
      <p><strong>Platform:</strong> ${problem.platform || '-'}</p>
      <p><strong>Tags:</strong> ${problem.tags.join(', ') || '-'}</p>
      <p><strong>Date:</strong> ${problem.date}</p>
      <p><strong>Notes:</strong><br>${problem.notes || '-'}</p>
      <span class="status ${problem.status}">${problem.status.toUpperCase()}</span>
      <div class="card-actions">
        <button onclick="markSolved('${problem.id}')">✅ Done</button>
        <button onclick="deleteProblem('${problem.id}')">🗑️ Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Initial load
fetchProblems();
let editId = null;

function openEditModal(id) {
  const problem = allProblems.find(p => p.id === id);
  if (!problem) return;

  editId = id;
  document.getElementById('editNotes').value = problem.notes;
  document.getElementById('editTags').value = problem.tags.join(', ');
  
  const modal = document.getElementById('editModal');
  modal.classList.add('visible');
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.remove('visible');
  editId = null;
}


async function saveEdit() {
  const notes = document.getElementById('editNotes').value.trim();
  const tags = document.getElementById('editTags').value.trim().split(',').map(t => t.trim());

  await fetch(`${API_URL}/${editId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: allProblems.find(p => p.id === editId)?.status || 'todo',
      notes: notes,
      tags: tags
    })
  });

  closeEditModal();
  fetchProblems();
}
