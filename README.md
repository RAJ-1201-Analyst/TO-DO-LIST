# To-Do App — OIBSIP Web Development Internship

## 📌 Objective

Build a to-do list web app that lets a user add, complete, edit, and delete tasks, with tasks split into Pending and Completed lists. Beyond the base requirements, I added persistence (tasks survive a page refresh) and timestamps on every task, using only vanilla JavaScript.

## 🛠️ Tools & Technologies Used

- **HTML5** — a single reusable `<template>` element for task markup, semantic `<section>`s with `aria-labelledby`
- **CSS3** — flexbox for layout, CSS custom properties for theming, a small `@keyframes` fade-in for newly added tasks
- **JavaScript (ES6+)** — DOM manipulation, `localStorage` for persistence, event delegation, the Web Storage `storage` event for cross-tab sync
- **Code editor**: VS Code
- **Version control**: Git & GitHub

## ⚙️ How It Works / Approach

**Data model**: every task is a plain object —
```js
{ id, text, completed, createdAt, completedAt, updatedAt }
```
`id` is generated from the current timestamp plus a random suffix (`Date.now().toString(36) + random`), so no external UUID library is needed. All tasks live in one array in memory; the Pending and Completed lists shown on screen are just that array filtered by `task.completed`, re-rendered after every change — there's no separate "state" per list to keep in sync.

**Persistence**: on every add/toggle/edit/delete, the full task array is written to `localStorage` as JSON. On load, it's read back and validated (`isValidTask`) so a corrupted or tampered value in storage can't crash the app — it just falls back to an empty list. A `storage` event listener also means if the app is open in two browser tabs, completing a task in one tab updates the other tab automatically.

**Rendering**: instead of building HTML strings (which risks XSS if task text ever contains `<` or `>`), each task list item is cloned from an HTML `<template>` element and populated field-by-field using `textContent` — never `innerHTML` — so task text is always treated as plain text, never parsed as markup.

**Editing flow**: clicking "Edit" swaps a task into an inline edit state — the `<span>` hides and a text `<input>` appears in its place, pre-filled and focused. It can be committed three ways: pressing **Enter**, clicking **Save**, or simply clicking/tabbing away (a `focusout` handler auto-saves, unless focus moved to that task's own Save/Cancel buttons). Pressing **Escape** or clicking **Cancel** discards the edit. An edit is only written (and only updates `updatedAt`) if the trimmed text actually changed and isn't empty.

**Validation**: the add form blocks empty or whitespace-only submissions and shows an inline error (`role="alert"` so it's announced immediately by screen readers) instead of silently doing nothing or adding a blank task.

**Events** are handled with delegated listeners on each list container (`click`, `change`, `keydown`, `focusout`) rather than binding a listener to every task — so newly added or edited tasks work immediately without re-binding anything.

**Timestamps**: every task records when it was created, and — separately — when it was completed or last edited. The completed list shows "Completed <date>" while the pending list shows "Added <date>", formatted with `toLocaleString()` so it respects the user's locale.

**Accessibility**: the pending/completed counts use `aria-live="polite"` so screen readers announce changes as tasks move between lists; the document `<title>` also updates to show the pending count (e.g. `(3) To-Do App`) so it's visible even from another browser tab.

## 📁 Project Structure

```
OIBSIP_WebDevelopment_TaskX/
├── index.html      → App shell, form, list sections, task <template>
├── style.css         → Layout, card styling, states, responsiveness
├── script.js          → State, persistence, rendering, all event handling
└── README.md
```

## ▶️ How to Run

1. Clone/download the repository
2. Open `index.html` directly in any browser — no build step, server, or dependencies required
3. Tasks are saved to that browser's `localStorage`, so they'll still be there next time you open the file (in the same browser)

## ✅ Outcome

A fully working to-do app with add, complete/uncomplete, inline edit, and delete — plus persistence across refreshes, timestamps on every task, and sync across open tabs, all without a framework or backend.

## 🎓 Key Learnings

- Structuring UI state as a single source-of-truth array and deriving both lists from it via `filter()`, instead of managing two separate lists
- Using `<template>` + `cloneNode` for repeated markup instead of string concatenation — and why that matters for avoiding XSS
- `localStorage` persistence, including defensively validating what comes back out of it
- The `storage` event for keeping multiple tabs of the same app in sync
- Building an inline-edit UX (commit on Enter/blur, cancel on Escape) that feels natural instead of requiring a separate "edit mode" page or modal
