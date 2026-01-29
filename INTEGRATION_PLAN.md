# LearnIt Backend-Frontend Integration Plan

## Executive Summary

This document outlines the integration plan to connect the LearnIt backend (Node.js/Express/Prisma) with the frontend (Next.js/React). The integration will establish end-to-end functionality while maintaining existing code structure and following clean architecture principles.

---

## 1. Current State Analysis

### 1.1 Backend Analysis

**Technology Stack:**
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Port: 4000 (default)

**Authentication:**
- JWT-based with `Authorization: Bearer <token>` header
- Token contains: `{ userId: string, role: string }`
- Token expiration: 7 days
- Middleware: `authenticate()` and `authorize(...roles)`

**Role System:**
- Database enum: `STUDENT`, `INSTRUCTOR`, `ADMIN`
- API authorization uses: `'INSTRUCTOR'`, `'ADMIN'`, `'STUDENT'` (uppercase)

**API Endpoints:**
```
POST   /api/auth/register     - User registration
POST   /api/auth/login         - User login
GET    /api/courses            - Get all courses (public)
POST   /api/courses            - Create course (INSTRUCTOR, ADMIN)
POST   /api/courses/lesson     - Upload lesson (INSTRUCTOR, ADMIN)
GET    /api/courses/:id        - Get course by ID
GET    /api/courses/instructor/:instructorId - Get instructor courses
GET    /api/subscriptions/plans - Get subscription plans
POST   /api/subscriptions/subscribe - Subscribe to plan
GET    /api/subscriptions/my   - Get user subscriptions
GET    /api/subscriptions/access - Check access
POST   /api/progress           - Update progress
GET    /api/progress/:courseId - Get course progress
GET    /api/progress           - Get user progress
GET    /api/quizzes/:lessonId  - Get quiz
POST   /api/quizzes/submit     - Submit quiz
GET    /api/quizzes/attempts/:quizId - Get quiz attempts
GET    /api/certificates       - (needs verification)
GET    /api/forum              - (needs verification)
GET    /api/support            - (needs verification)
```

**API Response Format:**
```typescript
// Login/Register Success
{
  message: string,
  token: string,
  user: {
    id: string,
    name: string,
    email: string,
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN"  // Uppercase
  }
}

// Error
{
  error: string
}
```

### 1.2 Frontend Analysis

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- CSS Modules

**Current Authentication:**
- Uses Next.js API routes (`/api/auth/login`) that return mock data
- Stores user in `localStorage`
- No JWT token storage
- No backend API calls

**Role System:**
- TypeScript types: `'student' | 'professor' | 'admin'` (lowercase)
- Frontend expects: `professor` (not `instructor`)
- ProtectedRoute checks: `user.role === requiredRole`

**Current API Flow:**
- Frontend → Next.js API Routes (`/app/api/*`) → Mock Data
- No connection to backend Express server

**Frontend API Routes (Mock):**
```
POST   /api/auth/login         - Returns mock user
GET    /api/courses            - Returns mockCourses
POST   /api/courses            - Adds to mockCourses
GET    /api/users              - Returns mockUsers
GET    /api/analytics          - Returns mockAnalytics
GET    /api/enrollments        - Returns mockEnrollments
GET    /api/certificates       - Returns mockCertificates
GET    /api/quizzes            - Returns mockQuizzes
GET    /api/forum              - Returns mockForum
GET    /api/progress           - Returns mockProgress
POST   /api/subscriptions/upgrade - Mock subscription
```

---

## 2. Critical Mismatches Identified

### 2.1 Role Naming Inconsistency
- **Backend:** `INSTRUCTOR` (uppercase)
- **Frontend:** `professor` (lowercase)
- **Impact:** Role-based routing and authorization will fail

### 2.2 Case Sensitivity
- **Backend returns:** `"STUDENT"`, `"INSTRUCTOR"`, `"ADMIN"` (uppercase)
- **Frontend expects:** `"student"`, `"professor"`, `"admin"` (lowercase)
- **Impact:** ProtectedRoute and role checks will fail

### 2.3 Authentication Token
- **Backend provides:** JWT token in response
- **Frontend:** Does not store or use token
- **Impact:** Cannot make authenticated API calls

### 2.4 API Base URL
- **Backend:** `http://localhost:4000/api/*`
- **Frontend:** Calls `http://localhost:3000/api/*` (Next.js routes)
- **Impact:** No connection between frontend and backend

### 2.5 Response Structure
- **Backend login:** `{ message, token, user }`
- **Frontend expects:** `{ user }` (no token)
- **Impact:** Token not captured, cannot authenticate subsequent requests

### 2.6 Missing Backend Endpoints
- Frontend expects endpoints that may not exist in backend
- Need to verify: enrollments, analytics, users management

---

## 3. Integration Strategy

### 3.1 Architecture Approach

**Option A: Direct API Calls (Recommended)**
- Frontend directly calls backend Express server
- Next.js API routes removed or act as proxies
- Simpler, fewer layers

**Option B: Next.js API Routes as Proxies**
- Keep Next.js routes, forward requests to backend
- Adds abstraction layer
- More complex but allows for request transformation

**Decision: Option A** - Direct calls for simplicity and performance.

### 3.2 Role Mapping Strategy

**Option A: Change Backend to Use PROFESSOR**
- Modify Prisma schema enum
- Requires database migration
- Breaking change

**Option B: Map INSTRUCTOR → professor in Frontend**
- Transform role in API client
- No backend changes
- Maintains backend consistency

**Decision: Option B** - Map roles in frontend API client layer.

### 3.3 Token Management Strategy

- Store JWT in `localStorage` (or `httpOnly` cookies for production)
- Include token in `Authorization: Bearer <token>` header
- Create API client utility to handle token injection
- Implement token refresh if needed

---

## 4. Detailed Integration Plan

### Phase 1: Foundation Setup

#### 1.1 Environment Configuration
**Files to Create/Modify:**
- `frontend/.env.local` (create)
- `frontend/.env.example` (create)

**Changes:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_TIMEOUT=30000
```

#### 1.2 API Client Utility
**File to Create:** `frontend/lib/apiClient.ts`

**Purpose:**
- Centralized API client with token management
- Automatic token injection
- Role transformation (INSTRUCTOR → professor)
- Error handling
- Request/response interceptors

**Key Features:**
- `getToken()` - Retrieve from localStorage
- `setToken(token)` - Store in localStorage
- `clearToken()` - Remove on logout
- `api.get()`, `api.post()`, etc. - Methods with auto token injection
- Role normalization: `INSTRUCTOR` → `professor`, uppercase → lowercase

#### 1.3 Type Definitions Alignment
**File to Modify:** `frontend/types/index.ts`

**Changes:**
- Ensure User type matches backend response
- Add API response types
- Add error types

### Phase 2: Authentication Integration

#### 2.1 Update AuthContext
**File to Modify:** `frontend/context/AuthContext.tsx`

**Changes:**
- Replace Next.js API route call with backend API call
- Store JWT token in localStorage
- Update user object with normalized role
- Handle token expiration
- Add token refresh logic if needed

**Key Modifications:**
```typescript
// Before: Calls /api/auth/login (Next.js route)
// After: Calls ${API_BASE_URL}/api/auth/login (Backend)

// Store token
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(normalizedUser));

// Normalize role
const normalizedRole = data.user.role.toLowerCase() === 'instructor' 
  ? 'professor' 
  : data.user.role.toLowerCase();
```

#### 2.2 Update Login API Route (Optional)
**File to Modify:** `frontend/app/api/auth/login/route.ts`

**Options:**
1. Remove file (direct backend calls)
2. Keep as proxy (forward to backend)
3. Keep for backward compatibility

**Decision:** Remove after AuthContext is updated.

#### 2.3 Logout Enhancement
**File to Modify:** `frontend/context/AuthContext.tsx`

**Changes:**
- Clear token from localStorage
- Optionally call backend logout endpoint (if exists)

### Phase 3: API Integration

#### 3.1 Courses API
**Files to Modify:**
- `frontend/app/api/courses/route.ts` → Remove or proxy
- Components using courses → Use `apiClient` directly

**Backend Endpoints:**
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (requires auth + INSTRUCTOR/ADMIN)
- `POST /api/courses/lesson` - Upload lesson (requires auth + INSTRUCTOR/ADMIN)

**Integration Steps:**
1. Create `frontend/lib/api/courses.ts` with typed functions
2. Update components to use new API functions
3. Handle authentication headers
4. Transform backend course structure to frontend format if needed

#### 3.2 Users API
**Files to Modify:**
- `frontend/app/api/users/route.ts` → Remove or proxy

**Backend Endpoints:**
- Need to verify if backend has user management endpoints
- If not, create: `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id`

**Integration Steps:**
1. Verify backend endpoints exist
2. Create `frontend/lib/api/users.ts`
3. Update admin dashboard to use new API

#### 3.3 Analytics API
**Files to Modify:**
- `frontend/app/api/analytics/route.ts` → Remove or proxy

**Backend Endpoints:**
- Need to create: `GET /api/analytics` (aggregate stats)

**Integration Steps:**
1. Create backend analytics endpoint
2. Create `frontend/lib/api/analytics.ts`
3. Update admin dashboard

#### 3.4 Subscriptions API
**Backend Endpoints:**
- `GET /api/subscriptions/plans` - Get plans
- `POST /api/subscriptions/subscribe` - Subscribe
- `GET /api/subscriptions/my` - Get user subscriptions
- `GET /api/subscriptions/access` - Check access

**Integration Steps:**
1. Create `frontend/lib/api/subscriptions.ts`
2. Update subscription components

#### 3.5 Progress API
**Backend Endpoints:**
- `POST /api/progress` - Update progress
- `GET /api/progress/:courseId` - Get course progress
- `GET /api/progress` - Get user progress

**Integration Steps:**
1. Create `frontend/lib/api/progress.ts`
2. Update student dashboard

#### 3.6 Quizzes API
**Backend Endpoints:**
- `GET /api/quizzes/:lessonId` - Get quiz
- `POST /api/quizzes/submit` - Submit quiz
- `GET /api/quizzes/attempts/:quizId` - Get attempts

**Integration Steps:**
1. Create `frontend/lib/api/quizzes.ts`
2. Update quiz components

### Phase 4: Role-Based Access Control

#### 4.1 Backend Role Verification
**Status:** Already implemented via `authorize()` middleware

**Verification:**
- Ensure all protected routes use `authenticate` + `authorize`
- Verify role checks match frontend expectations

#### 4.2 Frontend Role Protection
**File to Verify:** `frontend/components/ProtectedRoute.tsx`

**Current Implementation:**
- Checks `user.role === requiredRole`
- Redirects if mismatch

**Required Changes:**
- Ensure role normalization is applied before comparison
- Handle token expiration (redirect to login)

#### 4.3 Route Protection
**Files to Verify:**
- All dashboard pages use `<ProtectedRoute requiredRole="...">`
- Admin routes: `requiredRole="admin"`
- Professor routes: `requiredRole="professor"`
- Student routes: `requiredRole="student"`

### Phase 5: Data Transformation Layer

#### 5.1 Course Data Mapping
**Backend Course Structure:**
```typescript
{
  id: string,
  title: string,
  description: string,
  subjectId: string,
  instructorId: string,
  isPublished: boolean,
  createdAt: Date,
  subject: { id, code, name },
  instructor: { name },
  lessons: [...]
}
```

**Frontend Course Structure:**
```typescript
{
  id: string,
  title: string,
  description: string,
  category: string,
  instructor: string,
  enrolledCount: number,
  rating: number,
  minPlan: SubscriptionPlan,
  image?: string,
  modules?: Module[]
}
```

**Transformation Required:**
- Map `subject.name` → `category`
- Map `instructor.name` → `instructor`
- Calculate `enrolledCount` from enrollments
- Add `rating` (may need backend support)
- Map `lessons` → `modules` structure
- Handle `minPlan` (may need backend support)

**Solution:**
- Create transformer functions in `frontend/lib/transformers/course.ts`
- Apply in API client or components

#### 5.2 User Data Mapping
**Backend User:**
```typescript
{
  id: string,
  name: string,
  email: string,
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
}
```

**Frontend User:**
```typescript
{
  id: string,
  email: string,
  name: string,
  role: "student" | "professor" | "admin",
  avatar?: string
}
```

**Transformation:**
- Normalize role (lowercase, INSTRUCTOR → professor)
- Add default avatar if missing

### Phase 6: Error Handling & Loading States

#### 6.1 API Error Handling
**File to Create:** `frontend/lib/api/errors.ts`

**Features:**
- Standardized error types
- HTTP status code mapping
- User-friendly error messages
- Network error handling

#### 6.2 Loading States
**Implementation:**
- Add loading states to components
- Use React Suspense where applicable
- Show loading indicators during API calls

#### 6.3 Error Boundaries
**File to Create:** `frontend/components/ErrorBoundary.tsx`

**Purpose:**
- Catch API errors at component level
- Display user-friendly error messages
- Log errors for debugging

---

## 5. Implementation Checklist

### Backend Changes (Minimal)

- [ ] Verify all API endpoints are functional
- [ ] Ensure CORS is configured for `http://localhost:3000`
- [ ] Add user management endpoints if missing:
  - [ ] `GET /api/users` (ADMIN only)
  - [ ] `GET /api/users/:id`
  - [ ] `PUT /api/users/:id` (ADMIN only)
  - [ ] `DELETE /api/users/:id` (ADMIN only)
- [ ] Add analytics endpoint:
  - [ ] `GET /api/analytics` (ADMIN only)
- [ ] Verify enrollment endpoints exist or create:
  - [ ] `GET /api/enrollments`
  - [ ] `POST /api/enrollments`
- [ ] Add course rating/feedback if needed
- [ ] Document all API endpoints with request/response examples

### Frontend Changes

#### Foundation
- [ ] Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL`
- [ ] Create `frontend/lib/apiClient.ts` (API client utility)
- [ ] Create `frontend/lib/api/errors.ts` (error handling)
- [ ] Update `frontend/types/index.ts` (type alignment)

#### Authentication
- [ ] Update `frontend/context/AuthContext.tsx`:
  - [ ] Replace Next.js API calls with backend calls
  - [ ] Store JWT token
  - [ ] Normalize roles (INSTRUCTOR → professor)
  - [ ] Handle token expiration
- [ ] Remove or update `frontend/app/api/auth/login/route.ts`

#### API Integration
- [ ] Create `frontend/lib/api/courses.ts`
- [ ] Create `frontend/lib/api/users.ts`
- [ ] Create `frontend/lib/api/analytics.ts`
- [ ] Create `frontend/lib/api/subscriptions.ts`
- [ ] Create `frontend/lib/api/progress.ts`
- [ ] Create `frontend/lib/api/quizzes.ts`
- [ ] Create `frontend/lib/api/enrollments.ts` (if needed)
- [ ] Create `frontend/lib/transformers/course.ts` (data mapping)

#### Component Updates
- [ ] Update `frontend/app/admin/dashboard/page.tsx`:
  - [ ] Replace mock data with API calls
  - [ ] Add loading states
  - [ ] Add error handling
- [ ] Update `frontend/app/professor/dashboard/page.tsx`:
  - [ ] Replace mock data with API calls
  - [ ] Fetch instructor courses using `req.user.userId`
- [ ] Update `frontend/app/student/dashboard/page.tsx`:
  - [ ] Replace mock data with API calls
  - [ ] Fetch student enrollments and progress
- [ ] Update all components using mock data

#### Route Protection
- [ ] Verify `ProtectedRoute` handles normalized roles
- [ ] Add token validation on route access
- [ ] Handle 401 errors (redirect to login)

#### Cleanup
- [ ] Remove or deprecate `frontend/lib/mockData.ts` usage
- [ ] Remove Next.js API routes that are replaced
- [ ] Update documentation

---

## 6. API Contract Documentation

### 6.1 Authentication

#### POST /api/auth/login
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "STUDENT" | "INSTRUCTOR" | "ADMIN"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

#### POST /api/auth/register
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "STUDENT" | "INSTRUCTOR" | "ADMIN" (optional, defaults to STUDENT),
  "levelId": "uuid" (optional)
}
```

**Response (201):**
```json
{
  "message": "Successful registration",
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "STUDENT" | "INSTRUCTOR" | "ADMIN"
  }
}
```

### 6.2 Courses

#### GET /api/courses
**Auth:** None (public)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "subjectId": "uuid",
    "instructorId": "uuid",
    "isPublished": boolean,
    "createdAt": "ISO date",
    "subject": {
      "id": "uuid",
      "code": "string",
      "name": "string"
    },
    "instructor": {
      "name": "string"
    }
  }
]
```

#### POST /api/courses
**Auth:** Required (INSTRUCTOR or ADMIN)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "subjectId": "uuid",
  "instructorId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "subjectId": "uuid",
  "instructorId": "uuid",
  "isPublished": false,
  "createdAt": "ISO date"
}
```

### 6.3 Error Responses

**Standard Error Format:**
```json
{
  "error": "Error message string"
}
```

**Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 7. Testing Strategy

### 7.1 Unit Tests
- API client functions
- Data transformers
- Role normalization

### 7.2 Integration Tests
- Authentication flow
- API calls with tokens
- Role-based access

### 7.3 Manual Testing Checklist

#### Admin Flow
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] View all users
- [ ] View platform analytics
- [ ] Manage courses
- [ ] Cannot access professor/student dashboards

#### Professor Flow
- [ ] Login as instructor (backend) / professor (frontend)
- [ ] Access professor dashboard
- [ ] View own courses
- [ ] Create new course
- [ ] Upload lesson
- [ ] View student enrollments
- [ ] Cannot access admin/student dashboards

#### Student Flow
- [ ] Login as student
- [ ] Access student dashboard
- [ ] Browse courses
- [ ] Enroll in course
- [ ] View progress
- [ ] Take quiz
- [ ] View certificates
- [ ] Cannot access admin/professor dashboards

#### Cross-Cutting
- [ ] Token expiration handling
- [ ] 401 errors redirect to login
- [ ] 403 errors show appropriate message
- [ ] Network errors handled gracefully
- [ ] Loading states display correctly

---

## 8. Risk Mitigation

### 8.1 Backward Compatibility
- Keep Next.js API routes temporarily as fallback
- Use feature flags to switch between mock and real API
- Gradual migration per feature

### 8.2 Data Loss Prevention
- Do not modify existing backend data structures
- Create new endpoints if structure changes needed
- Version API if breaking changes required

### 8.3 Security
- Never expose JWT secret to frontend
- Validate all inputs on backend
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs

### 8.4 Performance
- Implement request caching where appropriate
- Use React Query or SWR for data fetching
- Optimize API response sizes
- Implement pagination for large datasets

---

## 9. Deployment Considerations

### 9.1 Environment Variables
**Backend:**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

**Frontend:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 9.2 Production Configuration
- Update CORS to production frontend URL
- Use environment-specific API URLs
- Enable HTTPS
- Configure proper error logging
- Set up monitoring

---

## 10. Timeline Estimate

- **Phase 1 (Foundation):** 2-3 hours
- **Phase 2 (Authentication):** 2-3 hours
- **Phase 3 (API Integration):** 4-6 hours
- **Phase 4 (RBAC):** 1-2 hours
- **Phase 5 (Data Transformation):** 2-3 hours
- **Phase 6 (Error Handling):** 1-2 hours
- **Testing & Bug Fixes:** 3-4 hours

**Total Estimated Time:** 15-23 hours

---

## 11. Next Steps

1. **Review this plan** with stakeholders
2. **Confirm approach** (direct API calls vs proxies)
3. **Verify backend endpoints** exist or need creation
4. **Set up development environment** (both servers running)
5. **Begin Phase 1** implementation
6. **Test incrementally** after each phase
7. **Document any deviations** from plan

---

## 12. Questions to Resolve

1. Should we keep Next.js API routes as proxies or remove them?
2. Do backend user management endpoints exist?
3. Do backend analytics endpoints exist?
4. Do backend enrollment endpoints exist?
5. Should we implement token refresh mechanism?
6. What is the production deployment strategy?
7. Are there any specific security requirements?

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-19  
**Author:** System Integration Team
