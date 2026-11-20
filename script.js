/* ==========================================================
   Student Task Manager - script.js
   Sections: 1 Data & State | 2 Storage | 3 CRUD | 4 Filter/Sort
            | 5 Rendering | 6 UI helpers | 7 Events | 8 Init
   ========================================================== */

/* ---------- 1. DATA & STATE ---------- */
const STORAGE_KEY = 'studentTasks';
const THEME_KEY = 'studentTheme';
const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

let tasks = [];                       // always mirrored to Local Storage
const state = { view: 'dashboard', search: '', filter: 'all', category: 'all', sort: 'due' };

const $ = (id) => document.getElementById(id);   // short helper for getElementById

const VIEW_INFO = {
  dashboard: ['Dashboard', 'Your tasks and deadlines at a glance.'],
  all: ['All Tasks', 'Every task you have added.'],
  pending: ['Pending Tasks', 'Tasks that still need work.'],
  completed: ['Completed Tasks', 'Tasks you have finished.'],
  today: ["Today's Tasks", 'Tasks due today.'],
  upcoming: ['Upcoming Deadlines', 'Pending tasks due after today.'],
  settings: ['Settings', 'Theme and data preferences.']
};

/* ---------- 2. LOCAL STORAGE ---------- */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));   // object -> string
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {                 // very first launch only
    tasks = getSampleTasks();
    saveTasks();
    return;
  }
  try { tasks = JSON.parse(saved) || []; }   // string -> object
  catch (e) { tasks = []; }
}

/* ---------- Date helpers ---------- */
function formatISO(date) {              // Date -> "YYYY-MM-DD" (local time)
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function todayStr() { return formatISO(new Date()); }
function dateFromToday(days) { const d = new Date(); d.setDate(d.getDate() + days); return formatISO(d); }
function formatDisplay(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isOverdue(task) { return task.status === 'pending' && task.dueDate < todayStr(); }
function generateId() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function getSampleTasks() {
  const make = (title, description, category, priority, offset, status, order) => ({
    id: generateId(), title, description, category, priority, dueDate: dateFromToday(offset),
    status, createdAt: Date.now() + order
  });
  return [
    make('Complete HTML assignment', 'Build the semantic page structure for the portfolio.', 'Assignment', 'High', -1, 'pending', 1),
    make('Practice JavaScript', 'Solve 10 array and DOM exercises.', 'Study', 'Medium', 0, 'pending', 2),
    make('Prepare for internship viva', 'Revise project flow and common questions.', 'Personal', 'High', 3, 'pending', 3),
    make('Complete CSS project', 'Finish the responsive landing page.', 'Project', 'Medium', 5, 'completed', 4),
    make('Revise Web Development concepts', 'HTML, CSS, JS and Local Storage notes.', 'Study', 'Low', 7, 'pending', 5)
  ];
}

/* ---------- 3. CRUD ---------- */
// Reads and validates form values. Returns the data object, or null if invalid.
function readAndValidateForm() {
  const title = $('title').value.trim();
  const dueDate = $('dueDate').value;
  let valid = true;
  $('titleError').textContent = ''; $('dateError').textContent = '';
  $('title').classList.remove('invalid'); $('dueDate').classList.remove('invalid');

  if (title === '') {
    $('titleError').textContent = 'Task title is required.'; $('title').classList.add('invalid'); valid = false;
  }
  if (dueDate === '' || isNaN(new Date(dueDate + 'T00:00:00'))) {
    $('dateError').textContent = 'Please choose a valid due date.'; $('dueDate').classList.add('invalid'); valid = false;
  }
  if (!valid) return null;
  return {
    title, dueDate,
    description: $('description').value.trim(),
    category: $('category').value,
    priority: $('priority').value,
    status: $('status').value
  };
}

function addTask(data) {
  tasks.push({ id: generateId(), createdAt: Date.now(), ...data });
  saveTasks(); refreshAll();
  showNotification('Task added successfully.');
}

function editTask(id, data) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  Object.assign(task, data);
  saveTasks(); refreshAll();
  showNotification('Task updated.');
}

async function deleteTask(id) {
  const ok = await confirmAction('Delete task', 'This task will be permanently deleted.', 'Delete');
  if (!ok) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(); refreshAll();
  showNotification('Task deleted.');
}

function toggleTaskStatus(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.status = task.status === 'completed' ? 'pending' : 'completed';
  saveTasks(); refreshAll();
  showNotification(task.status === 'completed' ? 'Task marked as completed.' : 'Task moved back to pending.');
}

/* ---------- 4. SEARCH / FILTER / SORT ---------- */
// Which tasks belong to the sidebar view that is open?
function matchesView(task) {
  switch (state.view) {
    case 'pending': return task.status === 'pending';
    case 'completed': return task.status === 'completed';
    case 'today': return task.dueDate === todayStr();
    case 'upcoming': return task.status === 'pending' && task.dueDate > todayStr();
    default: return true;
  }
}

function matchesFilter(task) {
  switch (state.filter) {
    case 'pending': return task.status === 'pending';
    case 'completed': return task.status === 'completed';
    case 'high': case 'medium': case 'low': return task.priority.toLowerCase() === state.filter;
    case 'overdue': return isOverdue(task);
    default: return true;
  }
}

function searchTasks(task) {
  const q = state.search.toLowerCase();
  return task.title.toLowerCase().includes(q) || (task.description || '').toLowerCase().includes(q);
}

function sortTasks(list) {
  const sorted = [...list];                        // copy so the original order is untouched
  if (state.sort === 'due') sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (state.sort === 'priority') sorted.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  if (state.sort === 'recent') sorted.sort((a, b) => b.createdAt - a.createdAt);
  return sorted;
}

function filterTasks() {
  const result = tasks.filter((t) =>
    matchesView(t) && matchesFilter(t) && searchTasks(t) &&
    (state.category === 'all' || t.category === state.category));
  return sortTasks(result);
}

/* ---------- 5. RENDERING ---------- */
function escapeHtml(text) {            // prevents users from injecting HTML
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createTaskCard(task) {
  const done = task.status === 'completed';
  const overdue = isOverdue(task);
  return `
    <article class="card task ${task.priority.toLowerCase()} ${overdue ? 'overdue' : ''} ${done ? 'done' : ''}">
      <h3>${escapeHtml(task.title)}</h3>
      ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
      <div class="tags">
        <span class="tag">${task.category}</span>
        <span class="tag ${task.priority.toLowerCase()}">${task.priority} priority</span>
        <span class="tag ${task.status}">${done ? 'Completed' : 'Pending'}</span>
        ${overdue ? '<span class="tag overdue">Overdue</span>' : ''}
      </div>
      <div class="task-foot">
        <span><i class="fa-regular fa-calendar"></i> ${formatDisplay(task.dueDate)}</span>
        <div class="actions" data-id="${task.id}">
          <button data-action="toggle" title="${done ? 'Mark as pending' : 'Mark as completed'}" aria-label="${done ? 'Mark as pending' : 'Mark as completed'}"><i class="fa-solid ${done ? 'fa-rotate-left' : 'fa-check'}"></i></button>
          <button data-action="edit" title="Edit task" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
          <button class="del" data-action="delete" title="Delete task" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </article>`;
}

function renderTasks() {
  const list = filterTasks();
  $('taskList').innerHTML = list.map(createTaskCard).join('');
  $('emptyState').hidden = list.length > 0;
}

function updateStatistics() {
  const completed = tasks.filter((t) => t.status === 'completed').length;
  $('statTotal').textContent = tasks.length;
  $('statCompleted').textContent = completed;
  $('statPending').textContent = tasks.length - completed;
  $('statOverdue').textContent = tasks.filter(isOverdue).length;
}

function updateProgress() {
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.length - completed;
  const percent = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  $('progressPercent').textContent = percent + '%';
  $('progressFill').style.width = percent + '%';
  $('progressBarWrap').setAttribute('aria-valuenow', percent);
  $('progressText').textContent = `${completed} completed, ${pending} pending`;
}

function renderUpcoming() {
  const next = tasks.filter((t) => t.status === 'pending' && t.dueDate >= todayStr())
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  $('upcomingList').innerHTML = next.length
    ? next.map((t) => `<li><span>${escapeHtml(t.title)}</span><small>${formatDisplay(t.dueDate)}</small></li>`).join('')
    : '<li><span>No upcoming deadlines.</span></li>';
}

function refreshAll() {               // one function that redraws everything
  updateStatistics(); updateProgress(); renderUpcoming(); renderTasks();
}

/* ---------- 6. UI HELPERS ---------- */
function showNotification(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'error' ? 'error' : '');
  toast.textContent = message;
  $('toastWrap').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Opens the confirm dialog and returns a Promise<boolean>
function confirmAction(title, message, yesLabel) {
  $('confirmTitle').textContent = title;
  $('confirmMessage').textContent = message;
  $('confirmYes').textContent = yesLabel;
  const dialog = $('confirmDialog');
  dialog.showModal();
  return new Promise((resolve) => {
    const finish = (answer) => { dialog.close(); resolve(answer); };
    $('confirmYes').onclick = () => finish(true);
    $('confirmNo').onclick = () => finish(false);
    dialog.oncancel = () => resolve(false);   // Esc key
  });
}

function openTaskDialog(task) {
  $('taskForm').reset();
  $('titleError').textContent = ''; $('dateError').textContent = '';
  $('title').classList.remove('invalid'); $('dueDate').classList.remove('invalid');
  if (task) {                                  // edit mode: fill the form
    $('dialogTitle').textContent = 'Edit task'; $('saveBtn').textContent = 'Save changes';
    $('taskId').value = task.id; $('title').value = task.title; $('description').value = task.description;
    $('category').value = task.category; $('priority').value = task.priority;
    $('dueDate').value = task.dueDate; $('status').value = task.status;
  } else {                                     // add mode
    $('dialogTitle').textContent = 'Add new task'; $('saveBtn').textContent = 'Add task';
    $('taskId').value = ''; $('dueDate').value = todayStr();
  }
  $('taskDialog').showModal();
  $('title').focus();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $('pageTitle').textContent = VIEW_INFO[view][0];
  $('pageSubtitle').textContent = VIEW_INFO[view][1];
  $('dashboardSection').hidden = view !== 'dashboard';
  $('taskSection').hidden = view === 'settings';
  $('settingsSection').hidden = view !== 'settings';
  closeMenu(); renderTasks();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  $('themeSelect').value = theme;
}
function openMenu() { $('sidebar').classList.add('open'); $('overlay').classList.add('show'); }
function closeMenu() { $('sidebar').classList.remove('open'); $('overlay').classList.remove('show'); }

/* ---------- 7. EVENT LISTENERS ---------- */
function setupEvents() {
  document.querySelectorAll('.nav-item').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  $('menuBtn').addEventListener('click', openMenu);
  $('overlay').addEventListener('click', closeMenu);

  $('addTaskBtn').addEventListener('click', () => openTaskDialog());
  $('emptyAddBtn').addEventListener('click', () => openTaskDialog());
  $('closeDialog').addEventListener('click', () => $('taskDialog').close());
  $('cancelBtn').addEventListener('click', () => $('taskDialog').close());

  // Form submit: validate, then add or edit
  $('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readAndValidateForm();
    if (!data) { showNotification('Please fix the highlighted fields.', 'error'); return; }
    const id = $('taskId').value;
    if (id) editTask(id, data); else addTask(data);
    $('taskDialog').close();
  });

  // Event delegation: one listener handles every card button
  $('taskList').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.parentElement.dataset.id;
    const action = btn.dataset.action;
    if (action === 'toggle') toggleTaskStatus(id);
    if (action === 'edit') openTaskDialog(tasks.find((t) => t.id === id));
    if (action === 'delete') deleteTask(id);
  });

  // Live search while typing
  $('searchInput').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    if (state.view === 'settings') setView('all'); else renderTasks();
  });

  $('filterChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderTasks();
  });
  $('categoryFilter').addEventListener('change', (e) => { state.category = e.target.value; renderTasks(); });
  $('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderTasks(); });

  // Settings
  $('themeSelect').addEventListener('change', (e) => applyTheme(e.target.value));
  $('loadSampleBtn').addEventListener('click', () => {
    tasks = tasks.concat(getSampleTasks()); saveTasks(); refreshAll(); showNotification('Sample tasks added.');
  });
  $('clearAllBtn').addEventListener('click', async () => {
    const ok = await confirmAction('Clear all tasks', 'Every task will be permanently deleted.', 'Clear all');
    if (!ok) return;
    tasks = []; saveTasks(); refreshAll(); showNotification('All tasks cleared.');
  });
}

/* ---------- 8. INIT ---------- */
function init() {
  $('todayDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  loadTasks();
  setupEvents();
  setView('dashboard');
  refreshAll();
}
document.addEventListener('DOMContentLoaded', init);
