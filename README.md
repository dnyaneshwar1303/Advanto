# Store Rating System

## Tech Stack

- Frontend: React.js + Vite + Tailwind CSS
- Backend: Node.js + Express.js (ES Modules)
- Database: MySQL

---

## Backend Setup

```bash
cd backend
npm install
npm start
```

Create `.env`

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_system

JWT_SECRET=your_secret_key
```

---

## Frontend Setup

```bash
cd frontend
cd vite-project
npm install
npm run dev
```

---

## Database Setup

Create database:

```sql
CREATE DATABASE store_rating_system;
USE store_rating_system;
```

Import the provided SQL file into the database.

---

## Admin Login

```
Email: admin@gmail.com
Password: Admin@123
```

---

## NormalUser Login

```
Email: user@gmail.com
Password: user@123
```
## Owner Login

```
Email: owner@gmail.com
Password: Owner@123
```
