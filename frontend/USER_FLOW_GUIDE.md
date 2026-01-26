# LMS Platform - User Flow Guide

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LMS Platform                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Login Page                          │   │
│  │  (Email + Password Authentication)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐    │
│  │  Student   │      │ Professor  │      │   Admin    │    │
│  │  Role      │      │   Role     │      │   Role     │    │
│  └────────────┘      └────────────┘      └────────────┘    │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐    │
│  │ Dashboard  │      │ Dashboard  │      │ Dashboard  │    │
│  │  + Routes  │      │  + Routes  │      │  + Routes  │    │
│  └────────────┘      └────────────┘      └────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Student User Flow

```
LOGIN
  │
  ├─► /student/dashboard
  │   ├─► View Learning Stats
  │   ├─► View Enrolled Courses
  │   ├─► View Certificates
  │   └─► Navigation Bar
  │
  ├─► /student/courses
  │   ├─► Browse All Courses
  │   ├─► Filter by Category
  │   ├─► View Course Details
  │   └─► Enroll in Course
  │
  ├─► /student/progress
  │   ├─► Track Course Progress
  │   ├─► View Hours Completed
  │   ├─► View Completion Rate
  │   └─► View Statistics
  │
  └─► Logout
```

## Professor User Flow

```
LOGIN
  │
  ├─► /professor/dashboard
  │   ├─► View Course Statistics
  │   ├─► Manage Courses
  │   ├─► View Student Enrollments
  │   ├─► Track Course Performance
  │   └─► View Student Submissions
  │
  └─► Logout
```

## Admin User Flow

```
LOGIN
  │
  ├─► /admin/dashboard
  │   ├─► View Platform Analytics
  │   ├─► User Management
  │   │   ├─► View All Users
  │   │   ├─► Add New User
  │   │   ├─► Edit User
  │   │   └─► Delete User
  │   │
  │   ├─► Course Management
  │   │   ├─► View All Courses
  │   │   ├─► Approve Courses
  │   │   ├─► Edit Courses
  │   │   └─► Remove Courses
  │   │
  │   └─► View Analytics
  │       ├─► Total Users
  │       ├─► Student Count
  │       ├─► Course Statistics
  │       ├─► Learning Hours
  │       ├─► Completion Rate
  │       └─► Certificates Issued
  │
  └─► Logout
```

## Component Relationship Diagram

```
┌─────────────────────────────────────┐
│      Root Layout                     │
│  ├─ AuthProvider                     │
│  └─ Navbar                           │
├─────────────────────────────────────┤
│                                      │
├─► Login Page                         │
│   ├─ Card Component                  │
│   └─ Button Component                │
│                                      │
├─► Protected Routes                   │
│   ├─ ProtectedRoute Wrapper          │
│   │  ├─ Navbar                       │
│   │  ├─ Dashboard Pages              │
│   │  │  ├─ Card Components           │
│   │  │  ├─ Button Components         │
│   │  │  └─ Stats Cards               │
│   │  └─ Other Pages                  │
│   │                                  │
│   └─ API Routes                      │
│       ├─ /api/auth/login             │
│       ├─ /api/courses                │
│       ├─ /api/enrollments            │
│       ├─ /api/users                  │
│       └─ /api/analytics              │
│                                      │
└─────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  API: /api/auth/login    │
│  - Validate credentials  │
│  - Return user object    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   AuthContext            │
│  - Store user in state   │
│  - Save to localStorage  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Redirect to Dashboard   │
│  based on user.role      │
└────────┬─────────────────┘
         │
         ├─► /student/dashboard
         ├─► /professor/dashboard
         └─► /admin/dashboard
```

## API Request/Response Flow

```
┌─────────────────────────────────────┐
│   Client Component                   │
│   (e.g., Student Dashboard)          │
└────────────┬────────────────────────┘
             │
             │ fetch('/api/courses')
             ▼
┌─────────────────────────────────────┐
│   API Route Handler                  │
│   (/api/courses/route.ts)            │
│   - GET handler                      │
│   - Process request                  │
└────────────┬────────────────────────┘
             │
             │ Access mockData.ts
             ▼
┌─────────────────────────────────────┐
│   Mock Database                      │
│   (mockCourses, mockUsers, etc.)     │
└────────────┬────────────────────────┘
             │
             │ Return filtered data
             ▼
┌─────────────────────────────────────┐
│   NextResponse.json()                │
│   Returns JSON response              │
└────────────┬────────────────────────┘
             │
             │ Response with status
             ▼
┌─────────────────────────────────────┐
│   Component receives data            │
│   Updates state                      │
│   Renders UI                         │
└─────────────────────────────────────┘
```

## Authentication Flow

```
┌────────────────────────────┐
│   User enters credentials   │
│   student@example.com       │
│   student123                │
└────────┬───────────────────┘
         │
         │ Form submitted
         ▼
┌────────────────────────────────────────┐
│   useAuth().login(email, password)     │
└────────┬───────────────────────────────┘
         │
         │ POST /api/auth/login
         ▼
┌────────────────────────────────────────┐
│   Validate against mockUsers           │
│   - Check email exists                 │
│   - Check password matches             │
└────────┬───────────────────────────────┘
         │
         ├─ Valid ──────────────────────┐
         │                              │
         │  return { user: {...} }      │
         │                              │
         ├─ Invalid ────────────────┐  │
         │                          │  │
         │  return { error: "..." } │  │
         │                          │  │
         ▼                          ▼  │
    ┌────────────────────┐   ┌──────┐ │
    │  Set error state   │   │ User │ │
    │  Show error msg    │   └──┬───┘ │
    └────────────────────┘      │     │
                                │     │
                                ▼     ▼
                        ┌────────────────────┐
                        │ AuthContext        │
                        │ setUser(userData)  │
                        │ Save to localStorage
                        └────────┬───────────┘
                                 │
                                 ▼
                        ┌────────────────────┐
                        │ Redirect based on  │
                        │ user.role          │
                        └────────────────────┘
```

## Page Navigation Map

```
                          ┌────────────┐
                          │   Login    │
                          │  /login    │
                          └─────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
            ┌────────────┐ ┌────────────┐ ┌────────────┐
            │  Student   │ │ Professor  │ │   Admin    │
            │ Dashboard  │ │ Dashboard  │ │ Dashboard  │
            │   /S/D     │ │   /P/D     │ │   /A/D     │
            └─────┬──────┘ └────────────┘ └────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
    ┌────────────┐    ┌────────────┐
    │  Courses   │    │ Progress   │
    │ /S/courses │    │/S/progress │
    └────────────┘    └────────────┘
```

## State Management Flow

```
┌──────────────────────────────────┐
│   AuthContext (React Context)     │
│                                   │
│  State:                           │
│  - user: User | null              │
│  - isLoading: boolean             │
│                                   │
│  Functions:                       │
│  - login(email, password)         │
│  - logout()                       │
└──────────────────────────────────┘
         │
         │ Provides to all components
         ▼
┌──────────────────────────────────┐
│   useAuth() Hook                  │
│                                   │
│   Used in:                        │
│   - ProtectedRoute                │
│   - Navbar                        │
│   - Dashboard Pages               │
│   - Login Page                    │
└──────────────────────────────────┘
```

## Responsive Layout Flow

```
                Desktop (1024px+)
                ────────────────
        ┌──────────────────────────┐
        │      Navbar              │
        │  Logo | Links | Profile  │
        ├──────────────────────────┤
        │                          │
        │   Grid Layout            │
        │  (2-3 columns)           │
        │                          │
        └──────────────────────────┘


                Tablet (768px-1023px)
                ────────────────
        ┌──────────────────────────┐
        │      Navbar              │
        │  Logo | Menu | Profile   │
        ├──────────────────────────┤
        │                          │
        │   Grid Layout            │
        │  (2 columns)             │
        │                          │
        └──────────────────────────┘


                Mobile (320px-767px)
                ────────────────
        ┌──────────────────────────┐
        │      Navbar              │
        │  Logo | Hamburger        │
        ├──────────────────────────┤
        │   Mobile Menu            │
        │  (Dropdown)              │
        ├──────────────────────────┤
        │                          │
        │   Grid Layout            │
        │  (1 column)              │
        │                          │
        └──────────────────────────┘
```

## File Import Dependencies

```
Page Components
    ↓
Imports: useAuth, ProtectedRoute, Navbar, Card, Button
    ↓
    ├─► AuthContext (useAuth)
    ├─► ProtectedRoute Component
    ├─► Navbar Component
    │   └─► useAuth, useRouter
    ├─► Card Component
    │   └─► Card.module.css
    └─► Button Component
        └─► Button.module.css

API Routes
    ↓
Imports: NextRequest, NextResponse, mockData
    ↓
    └─► mockData.ts
        ├─► mockUsers
        ├─► mockCourses
        ├─► mockEnrollments
        ├─► mockCertificates
        ├─► mockMaterials
        ├─► mockAssignments
        └─► mockAnalytics
```

## Demo Data Relationships

```
mockUsers (3)
    ├─ Student (ID: 1)
    ├─ Professor (ID: 2)
    └─ Admin (ID: 3)

mockCourses (4)
    ├─ Web Development
    ├─ React & Next.js
    ├─ Python Data Science
    └─ AWS Cloud

mockEnrollments (3)
    ├─ Student → Course 1 (65% progress)
    ├─ Student → Course 2 (40% progress)
    └─ Student → Course 3 (100% - completed)

mockCertificates (1)
    └─ Student → Course 3 (Completed)

mockAnalytics
    ├─ Total Users: 5420
    ├─ Total Courses: 156
    ├─ Certificates: 3245
    └─ Completion Rate: 68%
```

---

This guide provides a comprehensive visual representation of the LMS Platform's architecture and data flow. Refer back to this when building new features or understanding the application structure.
