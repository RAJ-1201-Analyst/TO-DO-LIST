To-Do-App 

📌 Objective

Build a to-do list web app that lets a user add, complete, edit, and delete tasks, with tasks split into Pending and Completed lists. Beyond the base requirements, I added persistence (tasks survive a page refresh) and timestamps on every task, using only vanilla JavaScript.                                       
 🛠️ Tools & Technologies Used

- **HTML5** — a single reusable `<template>` element for task markup, semantic `<section>`s with `aria-labelledby`
- **CSS3** — flexbox for layout, CSS custom properties for theming, a small `@keyframes` fade-in for newly added tasks
- **JavaScript (ES6+)** — DOM manipulation, `localStorage` for persistence, event delegation, the Web Storage `storage` event for cross-tab sync
- **Code editor**: VS Code
- **Version control**: Git & GitHub

⚙️ How It Works / Approach

**Data model**: every task is a plain object —
```js
 📁 Project Structure

▶️ How to Run

1. Clone/download the repository
2. Open `index.html` directly in any browser — no build step, server, or dependencies required
3. Tasks are saved to that browser's `localStorage`, so they'll still be there next time you open the file (in the same browser)
 ✅ Outcome

A fully working to-do app with add, complete/uncomplete, inline edit, and delete — plus persistence across refreshes, timestamps on every task, and sync across open tabs, all without a framework or backend.

🎓 Key Learnings

- Structuring UI state as a single source-of-truth array and deriving both lists from it via `filter()`, instead of managing two separate lists
- Using `<template>` + `cloneNode` for repeated markup instead of string concatenation — and why that matters for avoiding XSS
- `localStorage` persistence, including defensively validating what comes back out of it
- The `storage` event for keeping multiple tabs of the same app in sync
- Building an inline-edit UX (commit on Enter/blur, cancel on Escape) that feels natural instead of requiring a separate "edit mode" page or modal
