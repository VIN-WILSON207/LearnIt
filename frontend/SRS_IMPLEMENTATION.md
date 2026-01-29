# LearnIt - Smart Learning, Better Results

A comprehensive Learning Management System (LMS) designed for O/L and A/L ICT & Computer Science students in Sri Lanka, featuring subscription-based access control, interactive quizzes, community forums, and progress tracking.

## 📋 Software Requirements Specification (SRS) Implementation

### ✅ Requirement 1: Product Alignment & Branding

- **Status**: ✅ Complete
- **Deliverables**:
  - Platform rebranded to "LearnIt - Smart Learning, Better Results"
  - Color scheme updated to indigo/purple theme (#6366f1 primary)
  - Tagline and branding integrated into Navbar and login page
  - SEO-optimized metadata for platform discovery
  - Target audience identified: O/L and A/L students

### ✅ Requirement 2: User Roles & Registration Enhancements

- **Status**: ✅ Partial (Core Complete)
- **Implemented**:
  - Three user roles: Student, Professor/Instructor, Admin
  - Extended user model with `educationalLevel` (O/L or A/L)
  - Subscription system integrated into user model
  - User authentication with role-based dashboards

### ✅ Requirement 3: Subscription Management System

- **Status**: ✅ Complete
- **Features**:
  - Three subscription tiers: Free, Basic, Pro
  - Feature-based access control via `subscriptionMiddleware.ts`
  - Auto-downgrade on subscription expiry
  - Subscription upgrade API endpoint (`/api/subscriptions/upgrade`)
  - Mock payment processing (Stripe-ready architecture)
  - Plan comparison and pricing display

**Subscription Plans**:

```
Free: LKR 0/month
├─ Basic courses access
├─ Limited notes (5 pages)
├─ Community forums
└─ NO quizzes, certificates, or advanced analytics

Basic: LKR 299/month
├─ All basic courses
├─ Full study materials
├─ 3 quiz attempts/month
├─ Basic progress analytics
└─ NO certificates

Pro: LKR 999/month
├─ All content access
├─ Unlimited quiz attempts
├─ Download certificates
├─ Advanced analytics
└─ Priority support
```

### ✅ Requirement 4: Learning Materials & Course Structure

- **Status**: ✅ Complete
- **Features**:
  - Hierarchical course structure: Courses → Modules → Topics
  - Module-based content organization
  - Topic-level video and resource support
  - Minimum subscription level enforcement per course
  - Mock database with 5 sample courses

### ✅ Requirement 5: Assessments & Practice System

- **Status**: ✅ Complete
- **Features**:
  - **Quiz System** (`/api/quizzes`):
    - Multiple choice questions
    - Short answer questions
    - Timed quizzes with countdown
    - Passing score requirements
    - Subscription-based access control
  - **Quiz Component** (`QuizInterface.tsx`):
    - Interactive quiz UI with timer
    - Question navigation
    - Progress indicators
    - Immediate feedback on submission
    - Support for both auto-graded and instructor-reviewed questions
  - **Auto-grading**: Multiple choice questions auto-scored
  - **Access Restrictions**: Free plan blocked from quizzes

### ✅ Requirement 6: Progress Tracking & Certification

- **Status**: ✅ Complete
- **Features**:
  - **Progress Tracking** (`/api/progress`):
    - Course progress tracking (0-100%)
    - Module completion tracking
    - Time spent tracking
    - Current learning streak
    - Completion dates
  - **Certificates** (`/api/certificates`):
    - Certificate generation on course completion
    - Pro plan exclusive feature
    - Verification codes for authenticity
    - PDF download support (infrastructure ready)
    - Certificate revocation for admins
  - **Progress Dashboard** (`ProgressDashboard.tsx`):
    - Overall learning statistics
    - Courses in progress with detailed metrics
    - Certificates earned display
    - Time spent analytics
    - Next steps recommendations

### ✅ Requirement 7: Community & Support Features

- **Status**: ✅ Complete
- **Features**:
  - **Forum System** (`/api/forum`):
    - Course-specific discussion threads
    - Topic creation by any user
    - Reply system with nesting support
    - Instructor/Admin approval workflow
    - Moderation capabilities (approve, delete posts)
  - **Forum Component** (`ForumDiscussion.tsx`):
    - Create new discussions/topics
    - Post replies to discussions
    - View approval status
    - Role-based highlighting (Student, Instructor, Admin)
    - Discussion thread management
  - **FAQs** (`FAQPage.tsx`):
    - Comprehensive FAQ database
    - Categorized questions and answers
    - Expandable/collapsible interface
    - Support contact information

### ✅ Requirement 8: UI/UX Enhancements

- **Status**: ✅ Complete
- **Implemented Components**:
  - `SubscriptionCard.tsx` - Plan comparison and upgrade UI
  - `QuizInterface.tsx` - Interactive quiz taking experience
  - `ForumDiscussion.tsx` - Community discussion interface
  - `ProgressDashboard.tsx` - Learning analytics and progress
  - `FAQPage.tsx` - Help and support section
  - Responsive design for mobile, tablet, desktop
  - Accessible color contrasts and typography
  - Smooth animations and transitions

### ✅ Requirement 9: Security & Authentication

- **Status**: ✅ Complete
- **Features**:
  - **Authentication**:
    - React Context-based auth state management
    - JWT-ready API structure
    - Protected routes via ProtectedRoute component
    - Role-based route protection
  - **Authorization**:
    - Subscription-based access control
    - Role-based API endpoint restrictions
    - Feature-level permission checks via `subscriptionMiddleware`
  - **Data Security**:
    - Client-side validation
    - Server-side validation ready
    - Secure password handling (mock data)

### ✅ Requirement 10: Performance & Scalability

- **Status**: ✅ Architected
- **Optimizations**:
  - Server-side rendering capability via Next.js 14
  - Efficient component structure with CSS Modules
  - Lazy loading architecture for courses and content
  - Middleware-based permission checks
  - Mock database easily replaceable with real DB
  - API structure supports pagination (infrastructure ready)

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.3+
- **UI Library**: React 18
- **Styling**: CSS Modules with CSS Variables
- **State Management**: React Context API
- **Authentication**: Mock + JWT-ready
- **Database**: Mock data (replaceable with PostgreSQL/MongoDB)
- **Payment Ready**: Stripe integration structure in place

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx (ready)
│   ├── student/dashboard/page.tsx
│   ├── professor/dashboard/page.tsx
│   ├── admin/dashboard/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── subscriptions/
│   │   │   └── upgrade/route.ts
│   │   ├── quizzes/route.ts
│   │   ├── forum/route.ts
│   │   ├── progress/route.ts
│   │   └── certificates/route.ts
│   ├── layout.tsx (root layout with metadata)
│   └── page.tsx
├── components/
│   ├── SubscriptionCard.tsx & .module.css
│   ├── QuizInterface.tsx & .module.css
│   ├── ForumDiscussion.tsx & .module.css
│   ├── ProgressDashboard.tsx & .module.css
│   ├── FAQPage.tsx & .module.css
│   ├── Navbar.tsx & .module.css
│   ├── Button.tsx & .module.css
│   ├── Card.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx (state management)
├── lib/
│   ├── mockData.ts (database with extended schema)
│   └── subscriptionMiddleware.ts (access control)
├── types/
│   └── index.ts (comprehensive type definitions)
├── styles/
│   ├── globals.css (updated with LearnIt palette)
│   └── variables.css (CSS variables)
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── next.config.js
└── .eslintrc.json
```

---

## 📊 Data Models

### User Model

```typescript
{
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: "student" | "professor" | "admin";
  educationalLevel: "O/L" | "A/L";
  subscription: {
    plan: "free" | "basic" | "pro";
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "cancelled";
  }
}
```

### Course Model

```typescript
{
  id: string
  title: string
  category: string
  instructor: string
  minPlan: 'free' | 'basic' | 'pro'
  modules: Module[]
}
```

### Quiz Model

```typescript
{
  id: string
  courseId: string
  title: string
  totalQuestions: number
  duration: number (minutes)
  minPlan: 'free' | 'basic' | 'pro'
  passingScore: number
  questions: Question[]
}
```

### Certificate Model

```typescript
{
  id: string;
  userId: string;
  courseId: string;
  issuedDate: string;
  verificationCode: string;
  status: "issued" | "revoked";
}
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Subscriptions

- `GET /api/subscriptions/upgrade` - Get available plans
- `POST /api/subscriptions/upgrade` - Upgrade subscription

### Quizzes

- `GET /api/quizzes?courseId=X` - Get course quizzes
- `POST /api/quizzes` - Submit quiz attempt

### Forum

- `GET /api/forum?courseId=X` - Get course discussions
- `POST /api/forum` - Create discussion/reply
- `PATCH /api/forum` - Moderate content

### Progress

- `GET /api/progress?userId=X` - Get user progress
- `POST /api/progress` - Update progress

### Certificates

- `GET /api/certificates?userId=X` - Get user certificates
- `POST /api/certificates` - Issue certificate
- `DELETE /api/certificates` - Revoke certificate (admin)

---

## 🎯 Key Features

### For Students

✅ Free access to basic courses  
✅ Upgrade to Basic/Pro for premium content  
✅ Take quizzes and get immediate feedback  
✅ Track learning progress with analytics  
✅ Download certificates on course completion  
✅ Participate in course forums  
✅ Access study materials and resources

### For Instructors

✅ Create and manage courses  
✅ Track student progress  
✅ View class analytics  
✅ Moderate forum discussions  
✅ Access course-specific metrics

### For Admins

✅ Platform-wide analytics  
✅ User management  
✅ Subscription management  
✅ Forum moderation  
✅ Certificate revocation  
✅ System configuration

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run tests (setup required)
npm test

# Run e2e tests (setup required)
npm run test:e2e
```

---

## 🔐 Authentication

Default test credentials:

**Student**

- Email: `student@example.com`
- Password: `student123`

**Instructor**

- Email: `instructor@example.com`
- Password: `instructor123`

**Admin**

- Email: `admin@example.com`
- Password: `admin123`

---

## 💳 Subscription Plans

| Feature         | Free              | Basic        | Pro            |
| --------------- | ----------------- | ------------ | -------------- |
| **Price**       | Free              | LKR 299/mo   | LKR 999/mo     |
| Courses         | Basic Only        | All          | All            |
| Study Materials | Limited (5 pages) | Full         | Full           |
| Quizzes         | ❌                | ✅ (3/month) | ✅ (Unlimited) |
| Certificates    | ❌                | ❌           | ✅             |
| Analytics       | ❌                | Basic        | Advanced       |
| Support         | Community         | Email        | Priority       |

---

## 📈 Analytics

### Student Dashboard

- Learning progress percentage
- Courses completed/in progress
- Certificates earned
- Study streak
- Time spent per course
- Recent activity

### Admin Dashboard

- Total users (by subscription)
- Enrollment statistics
- Course performance metrics
- Quiz completion rates
- Forum activity
- System health

---

## 🛠️ Customization

### Adding New Courses

Edit `lib/mockData.ts`:

```typescript
mockCourses.push({
  id: 'new-course',
  title: 'Course Title',
  minPlan: 'free', // or 'basic', 'pro'
  modules: [...]
})
```

### Modifying Subscription Plans

Update `subscriptionMiddleware.ts` `planFeatures` object to add/remove features per plan.

### Styling

All colors use CSS variables in `styles/globals.css`:

- Primary: `--primary` (#6366f1)
- Accent: `--accent` (#ec4899)
- Borders: `--border-color` (#e5e7eb)

---

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Development Tips](./DEVELOPMENT_TIPS.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [UI Component Guide](./COMPONENT_GUIDE.md)
- [Database Schema](./DATABASE_SCHEMA.md)

---

## 🤝 Contributing

Contributions welcome! Please follow the existing code structure and style guidelines.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For support or questions:

- Email: `support@LearnIt.lk`
- GitHub Issues: [Report issues](https://github.com)
- Documentation: Check docs folder

---

## 🎯 Roadmap

### Phase 2 (Q2 2024)

- [ ] Real database integration (PostgreSQL)
- [ ] Stripe payment gateway
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Video conferencing for live classes
- [ ] Advanced reporting

### Phase 3 (Q3 2024)

- [ ] AI-powered tutoring
- [ ] Gamification (badges, leaderboards)
- [ ] Advanced search and filtering
- [ ] Content recommendation engine
- [ ] Multi-language support

---

**LearnIt - Empowering Sri Lankan Students with Quality Education**

Last Updated: January 2024
