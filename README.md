# Equipment Tracker – Full-Stack MVP

## Overview

**Equipment Tracker** is a full-stack single-page web application built as part of an **Intern Take-Home Assignment**.
The goal of the assignment was to design and implement a simple equipment management system demonstrating core frontend, backend, and database concepts within a limited time frame.

The application allows users to manage equipment records with full CRUD functionality and persistent storage.

---

## Assignment Reference

This project was built based on the requirements outlined in **`INTERN_ASSIGNMENT.txt`**, which asked for:

* A React single-page application
* A Node.js + Express backend
* Persistent data storage
* Clean code organization and basic validation
* Full CRUD operations for equipment records

All required features have been implemented, along with several **optional bonus enhancements**.

---

## Features

### Core Requirements (Completed)

* View a list of equipment in a table
* Add new equipment
* Edit existing equipment
* Delete equipment

Each equipment record includes:

* **Name** (text)
* **Type** (Machine, Vessel, Tank, Mixer)
* **Status** (Active, Inactive, Under Maintenance)
* **Last Cleaned Date** (date picker)

---

### Bonus Features (Implemented)

* **Search by equipment name**
* **Sorting**

  * Sort by name
  * Sort by last cleaned date
* **Filtering by status**

  * Active
  * Inactive
  * Under Maintenance
  * All
* **Enhanced date validation**

  * Prevents future dates
  * Prevents invalid date values

---

## Tech Stack

### Frontend

* React (Create React App)
* TypeScript
* react-bootstrap / Bootstrap
* Axios for API communication

### Backend

* Node.js
* Express
* TypeScript

### Database

* SQLite (file-based, persistent)

---

## Project Structure

```
D:.
│   README.md
│   .gitignore
│
├── backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   │
│   └── src
│       ├── server.ts
│       ├── controllers
│       │   └── equipment.controller.ts
│       ├── routes
│       │   └── equipment.routes.ts
│       ├── models
│       │   └── equipment.model.ts
│       └── db
│           └── database.ts
│
└── frontend
    ├── .env
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    │
    ├── public
    └── src
        ├── App.tsx
        ├── index.tsx
        ├── components
        │   ├── EquipmentForm.tsx
        │   └── EquipmentTable.tsx
        ├── services
        │   └── api.ts
        └── types
            └── Equipment.ts
```

---

## Environment Configuration

### Backend (`backend/.env`)

```
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

* `PORT`: API server port
* `CLIENT_ORIGIN`: Frontend origin for CORS configuration

---

### Frontend (`frontend/.env`)

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

* Base URL for all backend API requests

---

## Running the Project Locally

### Backend (API)

From the project root:

```bash
cd backend
npm install
npm run dev
```

* Runs on: `http://localhost:5000`
* API base URL: `http://localhost:5000/api`

---

### Frontend (React App)

From the project root:

```bash
cd frontend
npm install
npm start
```

* Runs on: `http://localhost:3000`
* Uses environment-based API configuration

---

## API Endpoints

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/equipment`     | Get all equipment |
| POST   | `/api/equipment`     | Add new equipment |
| PUT    | `/api/equipment/:id` | Update equipment  |
| DELETE | `/api/equipment/:id` | Delete equipment  |

---

## Design Decisions & Assumptions

* **SQLite** was chosen for simplicity and persistence without additional infrastructure.
* **TypeScript** is used on both frontend and backend for type safety and clearer contracts.
* **Separation of concerns**:

  * Backend uses routes, controllers, models, and database layers.
  * Frontend separates UI components, API services, and shared types.
* **Environment-based configuration** was added to avoid hard-coded URLs.
* The UI focuses on clarity and usability rather than advanced styling, per assignment scope.

---

## What I Would Improve With More Time

* More advanced validation and user feedback
* Automated tests (backend and frontend)
* Improved accessibility and keyboard navigation
* Environment-specific builds for production
* Improve UI and UX

---

## Notes

* Authentication, routing, testing, and deployment were intentionally excluded, as they were **not required by the assignment**.
* Bonus features were added only after completing all core requirements.
