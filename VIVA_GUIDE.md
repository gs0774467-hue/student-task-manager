# Viva Guide: Student Task Manager

## 1. Introduction
Student Task Manager is a browser-based dashboard where students add, track and finish tasks. It runs with HTML, CSS and JavaScript only and stores data in Local Storage.

## 2. Problem statement
Students juggle assignments, exams and projects, and often miss deadlines because tasks live in scattered notes. They need one simple place that shows what is pending, due today or overdue.

## 3. Objectives
- Build a complete CRUD application without a backend.
- Persist data across refreshes.
- Provide search, filter, sort and live statistics.
- Deliver a responsive, professional interface.

## 4. Technology stack
HTML5 (structure), CSS3 (design, responsive layout, themes), JavaScript (logic), Local Storage (saving), Google Fonts and Font Awesome (typography and icons).

## 5. Frontend architecture
Three layers: **HTML** holds the page, **CSS** styles it, **JavaScript** controls behaviour. JavaScript keeps one `tasks` array and one `state` object. Every change follows the same cycle: change data, `saveTasks()`, `refreshAll()` (redraw).

## 6. HTML structure
Semantic tags: `aside` (sidebar), `header` (top bar), `main` (content), `section` (dashboard, tasks, settings), `article` (cards), `dialog` (task form and confirmation), `form` with labelled inputs.

## 7. CSS layout and responsiveness
- CSS variables hold colours; dark mode changes them through `[data-theme="dark"]`.
- Sidebar is `position: fixed`; the content has a left margin equal to its width.
- Stats use CSS Grid; task cards use `repeat(auto-fill, minmax(300px, 1fr))`.
- Media queries at 1024px, 768px and 480px: stats go to 2 columns, the sidebar becomes a slide-in menu opened by the hamburger button, forms stack.

## 8. JavaScript logic
Load tasks, set up listeners, render. User actions update the `tasks` array, save it, then redraw statistics, progress, deadlines and the list.

## 9. DOM manipulation
`document.getElementById` selects elements. `innerHTML` draws task cards, `textContent` updates numbers, `classList.toggle` changes active states, `style.width` moves the progress bar.

## 10. Event handling
`click` on buttons, `input` for live search, `change` for selects, `submit` for the form. **Event delegation**: one listener on the task list handles every card's buttons using `data-action` attributes.

## 11. CRUD operations
Create `addTask()`, Read `renderTasks()`, Update `editTask()` and `toggleTaskStatus()`, Delete `deleteTask()`.

## 12. How Local Storage works
Local Storage keeps text key/value pairs in the browser. `JSON.stringify(tasks)` converts the array to text for `setItem`; `JSON.parse` converts it back after `getItem`. Samples are added only when the key does not exist yet.

## 13. Limitations
Data is only on one browser and device; no login; clearing browser data deletes tasks; about 5 MB storage limit; no reminders.

## 14. Future scope
Backend and database, user accounts, notifications, calendar view, export/import, drag and drop.

## Important functions explained
- `saveTasks()`: `localStorage.setItem('studentTasks', JSON.stringify(tasks))`.
- `loadTasks()`: reads the key; if it is `null` it inserts sample tasks, otherwise parses the saved text.
- `addTask(data)`: pushes `{id, createdAt, ...data}` into `tasks`, saves, redraws, shows a toast. Example: title "Read notes" becomes a new card at once.
- `editTask(id, data)`: finds the task with `find()` and updates it with `Object.assign`.
- `deleteTask(id)`: asks for confirmation, then `tasks.filter(t => t.id !== id)` keeps every task except that one.
- `toggleTaskStatus(id)`: flips `pending` and `completed`.
- `filterTasks()`: keeps tasks that match the sidebar view, chip filter, category and search text.
- `searchTasks(task)`: lower-cases both sides and uses `includes()`.
- `sortTasks(list)`: copies the list and uses `sort()`. Dates are `YYYY-MM-DD` text, so `localeCompare` sorts them correctly.
- `updateStatistics()` and `updateProgress()`: count with `filter().length`; percent = `completed / total * 100`.
- `renderTasks()`: builds HTML for each task with `map()` and shows the empty state when the list is empty.
- `showNotification()`: creates a toast `div`, appends it, and removes it after 3 seconds.

## 30+ possible viva questions
1. **Why Local Storage?** It needs no server and keeps data after refresh.
2. **Storage limit?** About 5 MB per origin.
3. **Is Local Storage secure?** No. Anyone using the browser can read it, so never store passwords.
4. **What can it store?** Only strings, so objects are converted with JSON.
5. **`JSON.stringify` vs `JSON.parse`?** Object to string, and string to object.
6. **Local Storage vs Session Storage?** Session Storage clears when the tab closes.
7. **Local Storage vs cookies?** Cookies are sent to the server and hold about 4 KB.
8. **What is the DOM?** The browser's tree of page elements that JavaScript can change.
9. **`getElementById` vs `querySelector`?** The first selects by id only; the second accepts any CSS selector.
10. **`innerHTML` vs `textContent`?** `innerHTML` parses HTML; `textContent` is plain text and safer.
11. **Why `escapeHtml`?** It stops a user typing HTML or scripts into a title (XSS).
12. **What is event delegation?** One parent listener handles events from many children, including ones added later.
13. **What is `e.preventDefault()`?** It stops the form's default page reload.
14. **`let`, `const`, `var`?** `const` cannot be reassigned, `let` is block scoped, `var` is older and function scoped.
15. **What is an arrow function?** A short function syntax: `t => t.id`.
16. **What do `map`, `filter`, `find` do?** Transform each item, keep matching items, return the first match.
17. **How is the unique ID made?** From the current time plus random characters.
18. **How is overdue detected?** Status is pending and due date is earlier than today.
19. **Why store dates as `YYYY-MM-DD`?** The format sorts and compares correctly as text.
20. **What is the spread operator `...`?** It copies properties of an object or array into a new one.
21. **How does dark mode work?** `data-theme` on `<html>` swaps CSS variable values; the choice is saved in Local Storage.
22. **What are CSS variables?** Reusable values like `--primary` declared in `:root`.
23. **Flexbox vs Grid?** Flexbox is one-dimensional; Grid is two-dimensional.
24. **What is a media query?** CSS that applies only at certain screen sizes.
25. **How is the sidebar responsive?** At 768px it moves off screen with `transform` and slides in when `.open` is added.
26. **Why semantic HTML?** Better accessibility, SEO and readability.
27. **What is `<dialog>`?** A built-in modal element opened with `showModal()`.
28. **How is validation done?** JavaScript checks the title and date, shows error text, and stops saving.
29. **How are sample tasks inserted once?** Only when `getItem` returns `null`.
30. **Why does clearing tasks not bring samples back?** An empty array `[]` is still saved, so the key exists.
31. **How do statistics update automatically?** Every change calls `refreshAll()`.
32. **What is a Promise?** An object for a future result; the confirm dialog returns one so `await` can wait for the answer.
33. **What does `async/await` do?** It lets asynchronous code read in a top-to-bottom order.
34. **Why not React?** The project requirement was vanilla JavaScript, which also shows core fundamentals.
35. **How would you add a backend?** Replace `saveTasks` and `loadTasks` with `fetch()` calls to an API and database.
36. **How did you test?** Manually: add, empty add, edit, delete, complete, search, filter, sort, refresh, dark mode, mobile view in DevTools.

## Demo plan (3 to 4 minutes)
1. Show the dashboard: stats, progress, upcoming deadlines.
2. Add a task; try an empty title to show validation.
3. Edit it, mark it completed, mark it pending again.
4. Search, use filters and sorting.
5. Refresh the page to prove persistence; open DevTools > Application > Local Storage and show the JSON.
6. Switch to dark mode; resize to mobile and open the menu.
7. Delete a task (confirmation) and open Settings.
