# LearnIt Developer Quick Reference

## 🎯 Quick Start

### Run the Project

```bash
npm install
npm run dev  # Visit http://localhost:3000
```

### Default Login Credentials

```
Student: student@example.com / student123
Instructor: instructor@example.com / instructor123
Admin: admin@example.com / admin123
```

---

## 📂 Key Directories

| Directory     | Purpose                                                  |
| ------------- | -------------------------------------------------------- |
| `app/api/`    | API endpoints (subscription, quiz, forum, etc.)          |
| `components/` | React components (SubscriptionCard, QuizInterface, etc.) |
| `context/`    | Global state (AuthContext)                               |
| `lib/`        | Utilities (mockData, subscriptionMiddleware)             |
| `types/`      | TypeScript interfaces                                    |
| `styles/`     | Global CSS and variables                                 |

---

## 🔑 Important Files

### Subscription System

- **Middleware**: `lib/subscriptionMiddleware.ts` - Permission checks
- **API**: `app/api/subscriptions/upgrade/route.ts` - Upgrade logic
- **Component**: `components/SubscriptionCard.tsx` - UI display

### Quiz System

- **API**: `app/api/quizzes/route.ts` - Quiz CRUD and submission
- **Component**: `components/QuizInterface.tsx` - Quiz UI
- **Mock Data**: `lib/mockData.ts` - Quiz definitions

### Forum System

- **API**: `app/api/forum/route.ts` - Discussion CRUD
- **Component**: `components/ForumDiscussion.tsx` - Forum UI
- **Mock Data**: `lib/mockData.ts` - Sample discussions

### Progress Tracking

- **API**: `app/api/progress/route.ts` - Progress updates
- **Component**: `components/ProgressDashboard.tsx` - Analytics UI
- **Certificates API**: `app/api/certificates/route.ts`

---

## 🛠️ Common Tasks

### Check User Subscription

```typescript
import {
  canAccessResource,
  getEffectivePlan,
} from "@/lib/subscriptionMiddleware";

// Check if user can access a resource
const canAccess = canAccessResource(user, "pro"); // true/false

// Get user's current effective plan (auto-downgraded if expired)
const plan = getEffectivePlan(user); // 'free' | 'basic' | 'pro'
```

### Add New Quiz Question Type

1. Update `QuestionType` in `types/index.ts`
2. Add question handling in `QuizInterface.tsx`
3. Add grading logic in `/api/quizzes/route.ts`

### Create New Course

Edit `lib/mockData.ts`:

```typescript
{
  id: 'new-course',
  title: 'Advanced CS',
  category: 'Computer Science',
  instructor: 'Dr. Silva',
  enrolledCount: 0,
  rating: 0,
  minPlan: 'basic', // free, basic, or pro
  image: 'course-image.jpg',
  modules: [
    {
      id: 'module1',
      courseId: 'new-course',
      title: 'Module 1: Fundamentals',
      topics: []
    }
  ]
}
```

### Add Forum Moderation

The forum API already supports:

```typescript
// Approve a reply
PATCH /api/forum
{ discussionId, replyId, action: 'approve' }

// Delete content
PATCH /api/forum
{ discussionId, replyId, action: 'delete' }
```

### Fetch User Progress

```typescript
// Get overall progress
GET /api/progress?userId=student1

// Update progress
POST /api/progress
{ userId, courseId, action: 'complete-module', moduleId }
```

---

## 💾 Database Integration (When Moving from Mock Data)

### Step 1: Set up Database

```bash
npm install prisma @prisma/client
npx prisma init
```

### Step 2: Update API Routes

Replace `mockData` imports with database queries:

```typescript
// Before (mock)
const user = mockUsers.find((u) => u.id === userId);

// After (database)
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### Step 3: Keep Types Consistent

Existing `types/index.ts` interfaces align with Prisma schema.

---

## 🎨 Styling Guide

### CSS Variables (Update in `styles/globals.css`)

```css
--primary: #6366f1 /* Main brand color */ --primary-dark: #4f46e5
  /* Darker shade */ --accent: #ec4899 /* Secondary color */
  --bg-primary: #ffffff /* Main background */ --bg-secondary: #f9fafb
  /* Secondary background */ --border-color: #e5e7eb /* Border color */
  --text-primary: #111827 /* Main text */ --text-secondary: #6b7280
  /* Secondary text */;
```

### Adding New Component Styles

```typescript
// MyComponent.tsx
import styles from './MyComponent.module.css';

export default function MyComponent() {
  return <div className={styles.container}>...</div>;
}
```

```css
/* MyComponent.module.css */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
```

---

## 🔐 Authorization Patterns

### Protect an API Route

```typescript
import {
  getEffectivePlan,
  canAccessResource,
} from "@/lib/subscriptionMiddleware";

export const POST = async (request: NextRequest) => {
  const user = await getUser(); // Your auth method

  if (!canAccessResource(user, "pro")) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }
  // Process request
};
```

### Protect a Component

```typescript
import { useAuth } from '@/context/AuthContext';
import { canAccessResource } from '@/lib/subscriptionMiddleware';

export default function FeatureComponent() {
  const { user } = useAuth();

  if (!canAccessResource(user, 'basic')) {
    return <div>Upgrade to access this feature</div>;
  }

  return <div>Premium Feature</div>;
}
```

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "status": 400
}
```

---

## 🧪 Testing Scenarios

### Test Free Plan Restrictions

1. Login as student (free plan)
2. Try to access quiz → Should see "subscription required" message
3. Try to download certificate → Should see upgrade prompt

### Test Subscription Upgrade

1. Login as student
2. Go to subscription settings
3. Click "Upgrade to Pro"
4. Verify plans fetched from `/api/subscriptions/upgrade`
5. Verify user subscription updated

### Test Quiz System

1. Access course with quiz
2. Start quiz → Timer should start
3. Answer questions → Progress indicator shows
4. Submit → Results should appear
5. Check score calculated correctly

### Test Forum Moderation

1. Create new discussion as student
2. Reply as instructor
3. Verify reply shows with role badge
4. Admin can approve/delete posts

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
/* 0px - 767px: Mobile (default) */
/* 768px - 1023px: Tablet */
/* 1024px+: Desktop */

@media (max-width: 768px) {
  /* Tablet and below */
}

@media (max-width: 640px) {
  /* Mobile only */
}
```

---

## 🚀 Performance Tips

1. **Lazy Load Components**:

   ```typescript
   const QuizComponent = dynamic(() => import("@/components/QuizInterface"));
   ```

2. **Optimize Images**: Use Next.js Image component

   ```typescript
   import Image from "next/image";
   ```

3. **API Caching**: Use appropriate cache headers

   ```typescript
   headers: { 'Cache-Control': 'max-age=3600' }
   ```

4. **Code Splitting**: Use CSS Modules for isolation

---

## 🐛 Debugging

### Enable Console Logging

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("Debug info");
}
```

### Check Subscription Status

```typescript
// In browser console
const user = JSON.parse(localStorage.getItem("user"));
console.log(user.subscription);
```

### API Response Debugging

```typescript
const res = await fetch("/api/endpoint");
const data = await res.json();
console.log({ status: res.status, data });
```

---

## 📦 Dependencies

- `next`: 14.0+
- `react`: 18.0+
- `typescript`: 5.3+
- `react-icons`: For icons (already in use)

### To Add New Dependencies

```bash
npm install package-name
npm install --save-dev @types/package-name  # If needed
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/quiz-improvements

# Make changes and test
npm run dev

# Commit
git add .
git commit -m "feat: add quiz improvements"

# Push
git push origin feature/quiz-improvements
```

---

## 📞 Troubleshooting

### Issue: Subscription not updating

- Check `lib/subscriptionMiddleware.ts` - verify dates
- Verify user object has subscription field
- Check mock data in `lib/mockData.ts`

### Issue: Quiz timer not working

- Verify `setInterval` running in useEffect
- Check component cleanup in cleanup function
- Browser might have timer issues if tab inactive

### Issue: Forum posts not appearing

- Check `/api/forum` endpoint response
- Verify moderation status (isApproved)
- Check forum component fetching logic

### Issue: Progress not updating

- Verify action parameter in POST body
- Check timestamp logic
- Ensure userId matches authenticated user

---

## 💡 Best Practices

1. **Always use types**: Never use `any` type
2. **Check permissions**: Use middleware before data access
3. **Handle errors**: Try/catch in API routes
4. **Responsive first**: Design mobile-first
5. **Consistent naming**: camelCase for JS, PascalCase for components
6. **Comment complex logic**: Especially subscription rules
7. **Test integrations**: Manually test each feature

---

## 📖 Related Documentation

- Full SRS coverage: [SRS_IMPLEMENTATION.md](./SRS_IMPLEMENTATION.md)
- Implementation checklist: [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- Component guide: [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) (create as needed)
- API documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (create as needed)

---

**Happy Coding! 🚀**

For questions or issues, refer to documentation files or check the codebase comments.
