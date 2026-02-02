# Backend Environment Setup Guide

## Quick Setup

1. **Create `.env` file** in the `backend/` directory
2. **Copy the template** from `.env.example`
3. **Update the DATABASE_URL** with your PostgreSQL connection string

## Step-by-Step Instructions

### 1. Create .env File

In the `backend/` directory, create a new file named `.env` (no extension).

### 2. Add Database URL

Add your PostgreSQL connection string. The format is:

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

**Examples:**

**Local PostgreSQL (default):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learnit?schema=public"
```

**With custom user:**
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/learnit?schema=public"
```

**Remote PostgreSQL:**
```env
DATABASE_URL="postgresql://user:password@host:5432/learnit?schema=public"
```

### 3. Add JWT Secret

Generate a strong random string for JWT_SECRET:

```env
JWT_SECRET="your-super-secret-key-change-this-in-production-12345"
```

**Quick way to generate a secret:**
- Use an online generator
- Or use Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Complete .env File

Your complete `.env` file should look like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learnit?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=4000
```

## Database Setup

### Option 1: Create Database Manually

1. **Open PostgreSQL** (pgAdmin, psql, or your preferred tool)
2. **Create a new database** named `learnit`:
   ```sql
   CREATE DATABASE learnit;
   ```

### Option 2: Let Prisma Create It

Prisma will create the database automatically if it has permissions.

## Run Migrations

After setting up `.env`:

```bash
cd backend
npx prisma migrate dev
```

This will:
- Create the database if it doesn't exist (if user has permissions)
- Run all migrations
- Generate Prisma Client

## Seed Database

After migrations:

```bash
npx prisma db seed
```

This will create:
- Admin user (email: `admin@learnit.com`, password: `admin123`)
- Levels (Ordinary Level, Advanced Level)
- Subjects (ICT, Mathematics, Science, Computer Science)
- Subscription Plans (Free, Basic, Pro)

## Verify Setup

1. **Check .env file exists** in `backend/` directory
2. **Verify DATABASE_URL** is correct
3. **Test connection:**
   ```bash
   npx prisma db pull
   ```
   This should connect successfully without errors.

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `backend/` directory
- Check file name is exactly `.env` (not `.env.txt` or `.env.local`)
- Restart terminal/command prompt after creating the file

### Error: "Connection refused" or "Database does not exist"
- Verify PostgreSQL is running
- Check DATABASE_URL credentials are correct
- Ensure database exists (or user has permission to create it)

### Error: "Password authentication failed"
- Verify username and password in DATABASE_URL
- Check PostgreSQL user permissions

## Production Notes

⚠️ **Important for Production:**
- Never commit `.env` file to git
- Use strong, unique JWT_SECRET
- Use secure database credentials
- Consider using environment variable management (AWS Secrets Manager, etc.)
