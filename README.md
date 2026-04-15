# Student Registration Platform

A simple **Express + EJS + PostgreSQL** student registration system for performing CRUD operations (Create, Read, Update, Delete).

---

## Project Info

This project is a full-stack web application built for managing student records using a local PostgreSQL database.

---

## Features

- Add new student
- View all students
- Edit student details
- Update student data
- Delete student records

---

## Tech Stack

- Node.js
- Express.js
- EJS (Template Engine)
- PostgreSQL
- HTML, CSS, JavaScript

---

## Project Structure

- app.js → Main Express app, routes, and PostgreSQL connection
- api/index.js → Vercel serverless entrypoint
- vercel.json → Vercel routing config
- package.json → Dependencies and scripts
- package-lock.json → Locked dependency tree
- sql/schema.sql → Database & table creation
- .env → Environment variables (DB config)
- views/index.ejs → Home page (form + list)
- views/edit.ejs → Edit page
- public/ → Static files (CSS, JS)

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

---

### 2. Create database

Run:

```bash
psql -U postgres -d student_registration -f sql/schema.sql
```

OR manually:

```sql
CREATE DATABASE student_registration;
USE student_registration;
```

---

### 3. Configure .env

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=shanbelkibre
DB_PASSWORD=postgres_password
DB_NAME=student_registration
```

---

### 4. Run project

```bash
npm run dev
```

---

### 5. Open in browser

```
http://localhost:3000
```

---

## Database Table Structure

### students

- id BIGSERIAL PRIMARY KEY
- name VARCHAR(100)
- age INT
- course VARCHAR(100)
- created_at TIMESTAMPTZ DEFAULT NOW()

---

## NPM Commands

```bash
npm install   # install dependencies
npm run dev   # start development server
npm start     # start production server
```

---

## Notes

- Make sure PostgreSQL is running before starting the project
- Do NOT upload .env file to GitHub
- Ensure correct DB credentials in .env

---

## Deployment Info

This project now includes a Vercel serverless entrypoint, but it still needs a hosted PostgreSQL database.

### Vercel deployment steps

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the project fields like this:

- Framework Preset: Other
- Root Directory: leave empty if this repo is the root
- Build Command: npm install
- Install Command: npm install
- Output Directory: leave empty
- Development Command: npm run dev

4. Add these environment variables in Vercel:

- PORT
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

5. Make sure the database values point to a hosted PostgreSQL server.

Recommended deployment platforms:

- Render
- Railway
- Fly.io
- Cyclic

Vercel needs a hosted PostgreSQL database, not local PostgreSQL.

---

## Future Improvements

- Add authentication (login/register)
- Improve UI with Tailwind CSS
- Add REST API layer
- Add form validation
- Deploy with cloud database

---

## Author

Shanbel Kibre
Software Engineering Student
Fullstack Developer | AI & DevOps Enthusiast
