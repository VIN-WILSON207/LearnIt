# Quick Setup Guide

## Backend Environment Setup

### Step 1: Create `.env` file in `backend/` directory

1. Navigate to the `backend` folder
2. Create a new file named `.env` (exactly this name, no extension)
3. Add the following content:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learnit?schema=public"
JWT_SECRET="learnit-secret-key-change-in-production"
PORT=4000
```

**⚠️ Important:** Update `DATABASE_URL` with your actual PostgreSQL credentials:
- Replace `postgres:postgres` with your PostgreSQL username:password
- Replace `learnit` with your database name (or create a database named `learnit`)
- If PostgreSQL is on a different port, update `5432`

### Step 2: Create Database (if needed)

**Option A: Using psql**
```sql
CREATE DATABASE learnit;
```

**Option B: Using pgAdmin**
- Open pgAdmin
- Right-click "Databases" → Create → Database
- Name: `learnit`
- Click Save

### Step 3: Run Migrations

```bash
cd backend
npx prisma migrate dev
```

### Step 4: Seed Database

```bash
npx prisma db seed
```

This creates:
- Admin user: `admin@learnit.com` / `admin123`
- Levels and Subjects
- Subscription Plans

### Step 5: Create Additional Test Users (Optional)

You can create users via the registration API or add them manually to the database.

**Via Registration API:**
```bash
# Student
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Student User","email":"student@example.com","password":"student123","role":"STUDENT"}'

# Instructor
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Instructor User","email":"instructor@example.com","password":"instructor123","role":"INSTRUCTOR"}'
```

## Frontend Environment Setup

### Step 1: Create `.env.local` file in `frontend/` directory

1. Navigate to the `frontend` folder
2. Create a new file named `.env.local`
3. Add the following content:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Start Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Backend should start on `http://localhost:4000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend should start on `http://localhost:3000`

## Test Login

1. Navigate to `http://localhost:3000/login`
2. Use credentials:
   - **Admin**: `admin@learnit.com` / `admin123`
   - Or register new users via the registration endpoint

## Common Issues

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `backend/` directory
- Check file name is exactly `.env` (not `.env.txt`)
- Restart terminal after creating the file

### "Connection refused" or "Database does not exist"
- Verify PostgreSQL is running
- Check DATABASE_URL credentials
- Create database manually if needed

### "Password authentication failed"
- Verify username and password in DATABASE_URL
- Check PostgreSQL user has proper permissions

## Need Help?

See `backend/SETUP_ENV.md` for detailed setup instructions.
