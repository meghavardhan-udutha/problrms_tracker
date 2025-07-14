// const API_URL = 'http://127.0.0.1:5000/problems';
// const API_URL = 'https://problems-tracker.onrender.com/'; //https://problems-tracker.onrender.com
const API_URL = window.location.origin + '/problems';
let currentFilter = 'all';
let allProblems = [];
let difficultyFilter = 'all';
let tagFilter = '';

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
  // const platform = document.getElementById('problemLink').value.trim();
  const link = document.getElementById('problemLink').value.trim(); 
  const difficulty = document.getElementById('difficulty').value;
  const tags = document.getElementById('tags').value.trim().split(',').map(tag => tag.trim());
  const notes = document.getElementById('notes').value.trim();

  const newProblem = {
  id: Date.now().toString(),
  title,
  link,
  tags,
  notes,
  status: 'todo',
  date: new Date().toISOString().split('T')[0],
  difficulty  // ✅ Add this
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
  console.log("Fetched problems:", allProblems);
  const list = document.getElementById('problemList');
  list.innerHTML = '';

  const filtered = allProblems.filter(problem => {
    const matchesStatus = currentFilter === 'all' || problem.status === currentFilter;
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesTag = tagFilter === '' || problem.tags.some(tag => tag.toLowerCase().includes(tagFilter));
    return matchesStatus && matchesDifficulty && matchesTag;
  });


 const groupedByDate = {};

filtered.forEach(problem => {
    if (!groupedByDate[problem.date]) {
      groupedByDate[problem.date] = [];
    }
    groupedByDate[problem.date].push(problem);
  });

  Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
    const dateHeader = document.createElement('h2');
    dateHeader.innerText = `📅 ${date}`;
    list.appendChild(dateHeader);

    groupedByDate[date].forEach(problem => {
      const card = document.createElement('div');
      card.className = 'problem-card';

      card.innerHTML = `
        <div class="problem-summary" onclick="toggleDetails('${problem.id}')">
          <strong>${problem.title}</strong> <span class="difficulty-tag">${problem.difficulty}</span><br>
          <small>📅 ${problem.date}</small>
        </div>
        <div class="problem-details" id="details-${problem.id}" style="display: none;">
          <p><strong>Tags:</strong> ${problem.tags.join(', ') || '-'}</p>
          <p><strong>Notes:</strong><br>${problem.notes || '-'}</p>
          <p><strong>Link:</strong> <a href="${problem.link}" target="_blank">${problem.link || '-'}</a></p>
          <p><strong>Status:</strong> ${problem.status.toUpperCase()}</p>
          <div class="card-actions">
            <button onclick="markSolved('${problem.id}')">✅ Done</button>
            <button onclick="openEditModal('${problem.id}')">✏️ Edit</button>
            <button onclick="deleteProblem('${problem.id}')">🗑️ Delete</button>
          </div>
        </div>
      `;


      list.appendChild(card);
    });
  });

}

function toggleDetails(id) {
  const section = document.getElementById(`details-${id}`);
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}


function applyFilters() {
  difficultyFilter = document.getElementById('difficultyFilter').value;
  tagFilter = document.getElementById('tagFilter').value.toLowerCase();
  displayProblems();  // re-render
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
function filterByDate() {
  const selectedDate = document.getElementById('filterDate').value;
  if (!selectedDate) return;

  fetch(`${API_URL}?date=${selectedDate}`)
    .then(res => res.json())
    .then(data => {
      allProblems = data;
      displayProblems();  // ✅ FIXED
    });
}

function clearDateFilter() {
  document.getElementById('filterDate').value = '';
  fetchProblems(); // fetch all problems again
}
