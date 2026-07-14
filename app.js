let currentUser = null;
let allTasks = [];
let currentFilter = 'all';

// AUTH STATE LISTENER
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.email;
    loadTasks();
  } else {
    currentUser = null;
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('userEmail').textContent = '';
  }
});

// SWITCH TABS
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('authError').textContent = '';
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) document.getElementById('authError').textContent = 'خطأ: ' + error.message;
});

// REGISTER
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const { error } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  });
  if (error) document.getElementById('authError').textContent = 'خطأ: ' + error.message;
  else document.getElementById('authError').style.color = '#22c55e', document.getElementById('authError').textContent = 'تم إنشاء الحساب! تفقد بريدك الإلكتروني للتأكيد.';
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

// LOAD TASKS
async function loadTasks() {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  allTasks = data || [];
  renderTasks();
  updateStats();
}

// ADD TASK
async function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { alert('يرجى إدخال عنوان المهمة'); return; }
  const desc = document.getElementById('taskDesc').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value || null;

  const { data, error } = await supabaseClient.from('tasks').insert([{
    user_id: currentUser.id,
    title,
    description: desc,
    priority,
    due_date: dueDate,
    status: 'pending'
  }]).select();

  if (error) { console.error(error); alert('حدث خطأ عند إضافة المهمة'); return; }
  allTasks.unshift(data[0]);
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskDueDate').value = '';
  renderTasks();
  updateStats();
}

// TOGGLE STATUS
async function toggleTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  const { error } = await supabaseClient.from('tasks').update({ status: newStatus }).eq('id', taskId);
  if (error) return;
  task.status = newStatus;
  renderTasks();
  updateStats();
}

// DELETE TASK
async function deleteTask(taskId) {
  if (!confirm('هل تريد حذف هذه المهمة؟')) return;
  const { error } = await supabaseClient.from('tasks').delete().eq('id', taskId);
  if (error) return;
  allTasks = allTasks.filter(t => t.id !== taskId);
  renderTasks();
  updateStats();
}

// FILTER TASKS
function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// RENDER TASKS
function renderTasks() {
  const list = document.getElementById('tasksList');
  let filtered = allTasks;
  if (currentFilter === 'pending') filtered = allTasks.filter(t => t.status === 'pending');
  else if (currentFilter === 'completed') filtered = allTasks.filter(t => t.status === 'completed');
  else if (currentFilter === 'high') filtered = allTasks.filter(t => t.priority === 'high');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">📋 لا توجد مهام هنا</div>';
    return;
  }

  list.innerHTML = filtered.map(task => {
    const isCompleted = task.status === 'completed';
    const priorityMap = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' };
    const priorityLabel = { low: '🟢 منخفضة', medium: '🟡 متوسطة', high: '🔴 عالية' };
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
    const dueDateStr = task.due_date ? new Date(task.due_date).toLocaleDateString('ar-SA') : '';

    return `
      <div class="task-card ${isCompleted ? 'completed' : ''}">
        <div class="task-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleTask('${task.id}')">${isCompleted ? '✓' : ''}</div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
          <div class="task-meta">
            <span class="priority-badge ${priorityMap[task.priority]}">${priorityLabel[task.priority]}</span>
            ${dueDateStr ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${dueDateStr}${isOverdue ? ' (متأخرة)' : ''}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-danger" onclick="deleteTask('${task.id}')">🗑</button>
        </div>
      </div>
    `;
  }).join('');
}

// UPDATE STATS
function updateStats() {
  document.getElementById('totalCount').textContent = allTasks.length;
  document.getElementById('pendingCount').textContent = allTasks.filter(t => t.status === 'pending').length;
  document.getElementById('doneCount').textContent = allTasks.filter(t => t.status === 'completed').length;
}