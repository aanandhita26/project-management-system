# Project Management System

A full-stack Project Management System with a React web application and React Native Expo mobile application using a shared Node.js/Express REST API and PostgreSQL database.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- bcrypt password hashing
- Protected API routes
- User-specific project and task authorization
- Secure token storage in the mobile application

### Projects
- Create projects
- View projects
- View individual projects
- Update projects
- Delete projects
- Project status:
  - Not Started
  - In Progress
  - Completed
- Search projects by name
- Filter projects by status

### Tasks
- Create tasks under projects
- View tasks
- View individual tasks
- Update tasks
- Delete tasks
- Complete/reopen tasks
- Task priority:
  - Low
  - Medium
  - High
- Task status:
  - Pending
  - In Progress
  - Completed
- Search tasks by name
- Filter tasks by status and priority

### Dashboard
- Total projects
- Total tasks
- Completed tasks
- Pending tasks
- Projects in progress

### Platforms
- Responsive React web application
- React Native Expo Android application
- Both applications use the same backend and PostgreSQL database

## Technology Stack

### Frontend
- React
- Vite
- React Router

### Mobile
- React Native
- Expo
- Expo Secure Store

### Backend
- Node.js
- Express.js
- REST API
- JWT
- bcryptjs
- Zod
- CORS

### Database
- PostgreSQL
- Prisma ORM

## Project Structure

```text
project-management-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── prisma/
│   └── server.js
│
├── web/
│   └── src/
│
├── mobile/
│   └── app/
│
└── README.md