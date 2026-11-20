# Student Task Manager

A responsive productivity dashboard that helps students organise assignments, study sessions, projects and deadlines. Built with plain HTML, CSS and JavaScript. Tasks are saved in the browser's Local Storage, so no backend or database is needed.

## Features
- Dashboard with live statistics (total, completed, pending, overdue) and a progress bar
- Add, edit, delete, complete and un-complete tasks with form validation
- Live search by title or description
- Filters (All, Pending, Completed, High, Medium, Low, Overdue) and category filter
- Sorting by due date, priority or recently added
- Sidebar views: Dashboard, All, Pending, Completed, Today's, Upcoming Deadlines, Settings
- Light and dark themes (remembered after refresh)
- Toast notifications, confirmation dialogs, empty-state message
- Sample tasks on first launch only, with load samples and clear all in Settings
- Responsive layout for desktop, laptop, tablet and mobile

## Technology stack
HTML5, CSS3, Vanilla JavaScript (ES6), Local Storage, Google Fonts (Plus Jakarta Sans), Font Awesome icons.

## Folder structure
```
student-task-manager/
├── index.html   (structure)
├── style.css    (styling, themes, responsive rules)
├── script.js    (logic, storage, rendering)
├── README.md
└── VIVA_GUIDE.md
```

## Installation and running
1. Install Visual Studio Code and the **Live Server** extension.
2. Open the `student-task-manager` folder in VS Code (File > Open Folder).
3. Right-click `index.html` and choose **Open with Live Server**.
4. The app opens in your browser. An internet connection is needed for fonts and icons.

## Screenshots
_Add screenshots here: desktop dashboard, dark mode, mobile view, add-task form._

## Future improvements
- Reminders and browser notifications
- Drag and drop task ordering
- Export and import tasks as JSON
- Calendar view
- User accounts with a backend database
