# Development Tips & Workflow

## Code Style & Best Practices

### Component Structure
```typescript
'use client';  // Only if using client-side features

import React from 'react';
import styles from './Component.module.css';

export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = React.useState('');

  React.useEffect(() => {
    // Side effects here
  }, []);

  return (
    <div className={styles.container}>
      {/* JSX here */}
    </div>
  );
};
```

### Adding New Features

#### 1. Create a New Student Page
```bash
# Create the directory
mkdir app/student/[new-feature]

# Create page.tsx
touch app/student/[new-feature]/page.tsx

# Create styles
touch app/student/[new-feature]/page.module.css
```

#### 2. Protect Routes
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="student">
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

#### 3. Add Navigation Link
Edit `components/Navbar.tsx`:
```typescript
{user.role === 'student' && (
  <Link href="/student/my-feature" className={styles.navItem}>
    My Feature
  </Link>
)}
```

## Testing Demo Accounts

### Scenario 1: Student Journey
1. Login with `student@example.com` / `student123`
2. View dashboard with stats
3. Browse available courses
4. Check progress on enrolled courses
5. View earned certificates

### Scenario 2: Professor Journey
1. Login with `professor@example.com` / `professor123`
2. View dashboard with course stats
3. See course listings
4. Check student enrollments

### Scenario 3: Admin Journey
1. Login with `admin@example.com` / `admin123`
2. View analytics dashboard
3. Review user management table
4. Check course management section

## Common Tasks

### Add a New API Endpoint

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Your logic here
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Use Authentication Context

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in</p>;

  return <p>Welcome, {user.name}!</p>;
}
```

### Create Reusable Components

```typescript
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

<Card className={styles.myCard}>
  <h2>Card Title</h2>
  <p>Card content</p>
  <Button variant="primary" onClick={handleClick}>
    Click Me
  </Button>
</Card>
```

## Styling Guidelines

### Using CSS Modules

```css
/* Component.module.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Color Reference
Use CSS variables from globals.css:
```css
color: var(--primary);           /* Main blue */
background: var(--secondary);    /* Light gray */
color: var(--text-primary);      /* Dark text */
border: 1px solid var(--border); /* Light border */
```

## Debugging Tips

### Check Component Props
```typescript
console.log('Props:', { prop1, prop2, children });
```

### Debug State Changes
```typescript
useEffect(() => {
  console.log('State updated:', state);
}, [state]);
```

### Test API Endpoints
```bash
# Use curl or Postman
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123"}'
```

### Browser DevTools
- Open DevTools: F12 or right-click → Inspect
- Check Console for errors
- Use Network tab to inspect API calls
- Use Application tab for localStorage

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  priority={false}
/>
```

### Code Splitting
Next.js automatically code-splits by page. Use dynamic imports for heavy components:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <p>Loading...</p> }
);
```

## Version Control

### Typical Git Workflow
```bash
# Create feature branch
git checkout -b feature/add-student-notifications

# Make changes and commit
git add .
git commit -m "Add student notification system"

# Push to GitHub
git push origin feature/add-student-notifications

# Create Pull Request on GitHub
```

### Useful Git Commands
```bash
git status                    # Check changes
git diff                      # View differences
git log --oneline            # View commit history
git reset --hard HEAD        # Undo all changes
git stash                    # Temporarily save changes
```

## Environment Variables

### Add New Environment Variable
1. Create `.env.local` file
2. Add variable: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
3. Access in code: `process.env.NEXT_PUBLIC_API_BASE_URL`

Note: Variables must start with `NEXT_PUBLIC_` to be accessible in browser.

## Build & Deployment

### Local Production Build
```bash
npm run build        # Build optimized version
npm start           # Start production server
```

### Check Build Size
```bash
npm run build

# Check output in .next folder
# Look for bundle analysis
```

## Troubleshooting Common Issues

### 1. "Module not found" error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### 2. Styles not applying
- Check CSS module import syntax
- Verify class name in JSX matches .module.css
- Check for typos in class names

### 3. Authentication not persisting
- Check localStorage in DevTools
- Ensure user data is JSON stringified
- Clear localStorage and re-login

### 4. API route not responding
- Check file is named `route.ts` not `route.tsx`
- Verify correct HTTP method (GET/POST)
- Check request body format

### 5. Page not found (404)
- Verify folder and file names
- Check file is named `page.tsx`
- Ensure correct nested folder structure

## Performance Metrics

### Core Web Vitals Targets
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Check Performance
Use Chrome DevTools → Lighthouse tab to audit performance.

## Helpful Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- VS Code Extensions: ESLint, Prettier, Thunder Client
- Postman: API testing
- Chrome DevTools: Browser debugging
- GitHub: Version control

## Next Steps

1. Explore the codebase
2. Modify mock data to add more courses
3. Add new pages and features
4. Connect to a real database
5. Deploy to production
6. Add more user features

---

Happy coding! 🚀
