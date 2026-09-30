/*
 * To-do app (vanilla JS).
 *
 * Task shape: { id, text, completed, createdAt, completedAt, updatedAt }
 * All tasks live in a single array and are rendered into the Pending or Completed list.
 * State persists to localStorage on every change (bonus) and every task shows a timestamp (bonus).
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'todo-app.tasks.v1';

  const form = document.getElementById('add-form');
  const input = document.getElementById('task-input');
  const formError = document.getElementById('form-error');
  const template = document.getElementById('task-template');

  const lists = {
    pending: {
      list: document.getElementById('pending-list'),
      empty: document.getElementById('pending-empty'),
      badge: document.getElementById('pending-badge'),
      counter: document.getElementById('pending-count'),
    },
    completed: {
      list: document.getElementById('completed-list'),
      empty: document.getElementById('completed-empty'),
      badge: document.getElementById('completed-badge'),
      counter: document.getElementById('completed-count'),
    },
  };

  let tasks = loadTasks();
  let editingId = null;

  /* ---------- Persistence ---------- */

  function isValidTask(task) {
    return Boolean(task) && typeof task.id === 'string' && typeof task.text === 'string';
  }

  function loadTasks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored.filter(isValidTask) : [];
    } catch (err) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Unable to persist tasks:', err);
    }
  }

  /* ---------- Helpers ---------- */

  function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatTimestamp(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function findTask(id) {
    return tasks.find((task) => task.id === id);
  }

  /* ---------- Actions ---------- */

  function addTask(text) {
    tasks.unshift({
      id: generateId(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: null,
    });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = findTask(id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    if (editingId === id) editingId = null;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    if (editingId === id) editingId = null;
    saveTasks();
    render();
  }

  function startEditing(id) {
    editingId = id;
    render();
  }

  function cancelEditing() {
    editingId = null;
    render();
  }

  function commitEdit(id, newText) {
    const task = findTask(id);
    const text = newText.trim();
    if (task && text && text !== task.text) {
      task.text = text;
      task.updatedAt = new Date().toISOString();
      saveTasks();
    }
    editingId = null;
    render();
  }

  /* ---------- Rendering ---------- */

  function createTaskElement(task) {
    const node = template.content.firstElementChild.cloneNode(true);
    const isEditing = editingId === task.id;

    node.dataset.id = task.id;
    node.classList.toggle('task--completed', task.completed);
    node.classList.toggle('task--editing', isEditing);

    const toggle = node.querySelector('.task__toggle');
    toggle.checked = task.completed;
    toggle.setAttribute('aria-label', task.completed ? 'Mark as pending' : 'Mark complete');
    toggle.title = task.completed ? 'Mark as pending' : 'Mark complete';

    // textContent (never innerHTML) so user input is treated as plain text
    const textEl = node.querySelector('.task__text');
    textEl.textContent = task.text;
    textEl.hidden = isEditing;

    const editInput = node.querySelector('.task__edit-input');
    editInput.value = task.text;
    editInput.hidden = !isEditing;

    const time = node.querySelector('.task__time');
    const showCompleted = task.completed && task.completedAt;
    time.dateTime = showCompleted ? task.completedAt : task.createdAt;
    time.textContent = showCompleted
      ? `Completed ${formatTimestamp(task.completedAt)}`
      : `Added ${formatTimestamp(task.createdAt)}`;

    if (isEditing) {
      const editButton = node.querySelector('[data-action="edit"]');
      const deleteButton = node.querySelector('[data-action="delete"]');
      editButton.textContent = 'Save';
      editButton.dataset.action = 'save';
      editButton.classList.add('btn--primary');
      deleteButton.textContent = 'Cancel';
      deleteButton.dataset.action = 'cancel';
      deleteButton.classList.remove('btn--danger');
    }

    return node;
  }

  function renderList(refs, items, label) {
    refs.list.replaceChildren(...items.map(createTaskElement));
    refs.badge.textContent = String(items.length);
    refs.counter.textContent = `${items.length} ${label}`;
    refs.empty.hidden = items.length > 0;
  }

  function render() {
    const pending = tasks.filter((task) => !task.completed);
    const completed = tasks.filter((task) => task.completed);

    renderList(lists.pending, pending, 'pending');
    renderList(lists.completed, completed, 'completed');

    document.title = pending.length ? `(${pending.length}) To-Do App` : 'To-Do App';

    const activeInput = document.querySelector('.task--editing .task__edit-input');
    if (activeInput) {
      activeInput.focus();
      activeInput.select();
    }
  }

  /* ---------- Events ---------- */

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      formError.hidden = false; // block empty / whitespace-only submissions
      input.focus();
      return;
    }
    formError.hidden = true;
    addTask(text);
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => {
    if (input.value.trim()) formError.hidden = true;
  });

  function handleListClick(event) {
    const actionButton = event.target.closest('[data-action]');
    const item = event.target.closest('.task');
    if (!actionButton || !item) return;

    const id = item.dataset.id;
    switch (actionButton.dataset.action) {
      case 'edit':
        startEditing(id);
        break;
      case 'delete':
        deleteTask(id);
        break;
      case 'save':
        commitEdit(id, item.querySelector('.task__edit-input').value);
        break;
      case 'cancel':
        cancelEditing();
        break;
      default:
        break;
    }
  }

  function handleListChange(event) {
    if (!event.target.classList.contains('task__toggle')) return;
    const item = event.target.closest('.task');
    if (item) toggleTask(item.dataset.id);
  }

  function handleListKeydown(event) {
    if (!event.target.classList.contains('task__edit-input')) return;
    const item = event.target.closest('.task');
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit(item.dataset.id, event.target.value);
    } else if (event.key === 'Escape') {
      cancelEditing();
    }
  }

  function handleListFocusOut(event) {
    if (!event.target.classList.contains('task__edit-input')) return;
    const item = event.target.closest('.task');
    // Save when focus leaves the field, unless it moved to this task's own Save/Cancel buttons
    if (event.relatedTarget && item.contains(event.relatedTarget)) return;
    if (editingId === item.dataset.id) commitEdit(item.dataset.id, event.target.value);
  }

  [lists.pending.list, lists.completed.list].forEach((list) => {
    list.addEventListener('click', handleListClick);
    list.addEventListener('change', handleListChange);
    list.addEventListener('keydown', handleListKeydown);
    list.addEventListener('focusout', handleListFocusOut);
  });

  // Keep multiple open tabs in sync
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      tasks = loadTasks();
      render();
    }
  });

  render();
})();
