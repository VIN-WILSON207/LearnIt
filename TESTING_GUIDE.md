# Integration Testing Guide

This guide will help you test the complete integration between the frontend and backend.

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend should be running on `http://localhost:4000`

2. **Frontend Server Running**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend should be running on `http://localhost:3000`

3. **Environment Variables**
   - `frontend/.env.local` should contain:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
     NEXT_PUBLIC_API_TIMEOUT=30000
     ```

4. **Database Setup**
   - Ensure PostgreSQL is running
   - Run migrations: `cd backend && npx prisma migrate dev`
   - Seed database if needed: `cd backend && npx prisma db seed`

## Test Credentials

You'll need to create users in the database. Use the registration endpoint or seed script.

### Option 1: Register New Users
Use the registration API or frontend to create:
- **Student**: email: `student@example.com`, password: `student123`, role: `STUDENT`
- **Instructor**: email: `instructor@example.com`, password: `instructor123`, role: `INSTRUCTOR`
- **Admin**: email: `admin@example.com`, password: `admin123`, role: `ADMIN`

### Option 2: Use Existing Users
If you have existing users in the database, use those credentials.

## Testing Checklist

### ✅ Phase 1: Authentication Flow

#### Test 1.1: Student Login
1. Navigate to `http://localhost:3000/login`
2. Enter student credentials
3. **Expected**: 
   - Login successful
   - Redirected to `/student/dashboard`
   - JWT token stored in localStorage
   - User data displayed correctly

#### Test 1.2: Instructor Login
1. Navigate to `http://localhost:3000/login`
2. Enter instructor credentials
3. **Expected**:
   - Login successful
   - Redirected to `/instructor/dashboard`
   - Role normalized to 'instructor' (not 'professor')

#### Test 1.3: Admin Login
1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials
3. **Expected**:
   - Login successful
   - Redirected to `/admin/dashboard`

#### Test 1.4: Invalid Credentials
1. Try logging in with wrong password
2. **Expected**: Error message displayed

#### Test 1.5: Token Persistence
1. Login successfully
2. Refresh the page
3. **Expected**: User remains logged in (token in localStorage)

### ✅ Phase 2: Student Dashboard

#### Test 2.1: View Dashboard
1. Login as student
2. Navigate to `/student/dashboard`
3. **Expected**:
   - Dashboard loads with real data
   - Shows enrolled courses count
   - Shows completed courses count
   - Shows certificates count

#### Test 2.2: View Enrollments
1. As student, view dashboard
2. **Expected**:
   - Enrolled courses displayed
   - Progress bars show correct percentages
   - Course details loaded from backend

#### Test 2.3: View Progress
1. As student, check course progress
2. **Expected**:
   - Progress data fetched from `/api/progress`
   - Progress bars accurate

#### Test 2.4: View Certificates
1. As student (with certificates)
2. **Expected**:
   - Certificates displayed
   - Certificate details correct

### ✅ Phase 3: Instructor Dashboard

#### Test 3.1: View Dashboard
1. Login as instructor
2. Navigate to `/instructor/dashboard`
3. **Expected**:
   - Dashboard loads
   - Shows courses created count
   - Shows total students count
   - Shows published courses count

#### Test 3.2: View Courses
1. As instructor, view "My Courses"
2. **Expected**:
   - Only instructor's courses displayed
   - Course data from `/api/courses/instructor/:instructorId`
   - Course status (Published/Draft) shown correctly

#### Test 3.3: Create Course (if implemented)
1. Click "Create New Course"
2. Fill in course details
3. **Expected**: Course created via `/api/courses`

### ✅ Phase 4: Admin Dashboard

#### Test 4.1: View Dashboard
1. Login as admin
2. Navigate to `/admin/dashboard`
3. **Expected**:
   - Analytics cards show real data
   - Total users, students, courses displayed
   - Data from `/api/analytics`

#### Test 4.2: View Users
1. As admin, view "User Management"
2. **Expected**:
   - All users listed
   - Roles displayed correctly (normalized)
   - Data from `/api/users`

#### Test 4.3: View Courses
1. As admin, view "Course Management"
2. **Expected**:
   - All courses listed
   - Course details from `/api/courses`

### ✅ Phase 5: Role-Based Access Control

#### Test 5.1: Student Access
1. Login as student
2. Try to access `/admin/dashboard`
3. **Expected**: Redirected to `/student/dashboard`

#### Test 5.2: Instructor Access
1. Login as instructor
2. Try to access `/admin/dashboard`
3. **Expected**: Redirected to `/instructor/dashboard`

#### Test 5.3: Admin Access
1. Login as admin
2. Try to access `/student/dashboard`
3. **Expected**: Can access (or redirected based on implementation)

### ✅ Phase 6: API Integration

#### Test 6.1: API Calls with Token
1. Login as any user
2. Open browser DevTools → Network tab
3. Navigate to dashboard
4. **Expected**:
   - API calls include `Authorization: Bearer <token>` header
   - Requests go to `http://localhost:4000/api/*`

#### Test 6.2: Token Expiration
1. Wait for token to expire (or manually remove from localStorage)
2. Try to access protected route
3. **Expected**: Redirected to login

#### Test 6.3: Error Handling
1. Stop backend server
2. Try to login or access dashboard
3. **Expected**: Error message displayed gracefully

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom**: `Access-Control-Allow-Origin` error in console

**Solution**: 
- Check backend CORS configuration in `backend/src/index.ts`
- Ensure `app.use(cors())` is enabled
- For production, configure specific origins

### Issue 2: 401 Unauthorized
**Symptom**: API calls return 401

**Solution**:
- Check if token is stored in localStorage
- Verify token is included in Authorization header
- Check token expiration
- Verify backend JWT_SECRET matches

### Issue 3: Role Mismatch
**Symptom**: User redirected incorrectly

**Solution**:
- Verify role normalization in `frontend/lib/apiClient.ts`
- Check ProtectedRoute role checks
- Ensure backend returns correct role format

### Issue 4: Data Not Loading
**Symptom**: Dashboard shows loading forever

**Solution**:
- Check browser console for errors
- Verify API endpoints exist in backend
- Check network tab for failed requests
- Verify database has data

### Issue 5: Environment Variable Not Working
**Symptom**: API calls go to wrong URL

**Solution**:
- Verify `.env.local` file exists in `frontend/` directory
- Restart Next.js dev server after adding env vars
- Check variable name starts with `NEXT_PUBLIC_`

## Manual API Testing

You can also test APIs directly using curl or Postman:

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123"}'
```

### Get Courses (with token)
```bash
curl -X GET http://localhost:4000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Analytics (Admin only)
```bash
curl -X GET http://localhost:4000/api/analytics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Success Criteria

✅ All three roles can login successfully  
✅ Dashboards load with real data from backend  
✅ Role-based routing works correctly  
✅ API calls include authentication tokens  
✅ Error handling works gracefully  
✅ Loading states display correctly  
✅ No console errors  
✅ Data persists across page refreshes  

## Next Steps After Testing

1. **Fix any issues** found during testing
2. **Add missing features** (if any)
3. **Optimize performance** (if needed)
4. **Add more error handling** (if needed)
5. **Document API endpoints** (if not done)
6. **Prepare for production** deployment

---

**Note**: This is a comprehensive testing guide. Test systematically and document any issues you find.
