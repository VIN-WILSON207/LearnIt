# LMS Platform - Setup & Installation Guide

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Login with Demo Credentials

Choose one of the following accounts to test different features:

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | student123 |
| Professor | professor@example.com | professor123 |
| Admin | admin@example.com | admin123 |

## Project Features

### Authentication
- Email/password login system
- Role-based access control (Student, Professor, Admin)
- Persistent login using localStorage
- Protected routes with automatic redirection
- Logout functionality

### Student Features
✅ Dashboard with learning statistics  
✅ Browse available courses  
✅ Track progress on enrolled courses  
✅ View earned certificates  
✅ Progress analytics  

### Professor Features
✅ Manage courses  
✅ View student enrollments  
✅ Track course performance  
✅ Upload course materials  
✅ View student progress  

### Admin Features
✅ User management  
✅ Course approval/rejection  
✅ Platform analytics  
✅ System-wide statistics  
✅ User role assignment  

## File Structure

```
frontend/
├── app/
│   ├── (auth)/login/                    # Login page
│   ├── api/                             # API routes
│   │   ├── auth/login/route.ts         # Login endpoint
│   │   ├── courses/route.ts            # Course endpoints
│   │   ├── enrollments/route.ts        # Enrollment endpoints
│   │   ├── users/route.ts              # User management
│   │   └── analytics/route.ts          # Analytics data
│   ├── student/
│   │   ├── dashboard/page.tsx          # Student home
│   │   ├── courses/page.tsx            # Browse courses
│   │   └── progress/page.tsx           # Progress tracking
│   ├── professor/
│   │   └── dashboard/page.tsx          # Professor home
│   ├── admin/
│   │   └── dashboard/page.tsx          # Admin home
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Home (redirects)
│
├── components/
│   ├── Button.tsx                       # Reusable button
│   ├── Button.module.css
│   ├── Card.tsx                         # Reusable card
│   ├── Card.module.css
│   ├── Navbar.tsx                       # Navigation bar
│   ├── Navbar.module.css
│   └── ProtectedRoute.tsx               # Route protection
│
├── context/
│   └── AuthContext.tsx                  # Auth state management
│
├── lib/
│   └── mockData.ts                      # Mock database
│
├── styles/
│   └── globals.css                      # Global styles
│
├── public/                              # Static assets
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── next.config.js                       # Next.js config
└── README.md                            # Project docs
```

## Available Commands

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Endpoints Reference

### Authentication
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: { id, email, name, role, avatar } }
```

### Courses
```
GET /api/courses                    # Get all courses
POST /api/courses                   # Create course (body: course object)
```

### Enrollments
```
GET /api/enrollments                # Get all enrollments
GET /api/enrollments?studentId=X    # Get student enrollments
POST /api/enrollments               # Create enrollment
```

### Users
```
GET /api/users                      # Get all users
GET /api/users?role=student         # Get users by role
```

### Analytics
```
GET /api/analytics                  # Get platform stats
```

## Styling

### Color Scheme
- Primary Blue: `#0066cc`
- Secondary Light: `#f0f2f5`
- Accent Orange: `#ff6b35`
- Text Dark: `#1f2937`
- Text Light: `#6b7280`
- Border: `#e5e7eb`

### CSS Structure
- Global styles in `styles/globals.css`
- Component styles in individual `.module.css` files
- Mobile-first responsive design
- CSS variables for consistent theming

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Customization Guide

### Change Colors
Edit `styles/globals.css` CSS variables:
```css
:root {
  --primary: #0066cc;        /* Change main color */
  --secondary: #f0f2f5;      /* Change background */
  --accent: #ff6b35;         /* Change accent */
}
```

### Add New Routes
1. Create folder under `app/` with route name
2. Add `page.tsx` component
3. Use `ProtectedRoute` wrapper for protected pages
4. Use `Navbar` component for navigation

### Add New API Endpoint
1. Create folder under `app/api/`
2. Create `route.ts` file with GET/POST handlers
3. Use `NextRequest`/`NextResponse` from Next.js

### Connect Real Database
1. Install database client (e.g., MongoDB, PostgreSQL)
2. Replace mock data imports with database queries
3. Update API routes to use your database
4. Update `mockData.ts` references

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Vercel automatically deploys on push
4. Set environment variables in Vercel dashboard

### Deploy to Netlify

1. Build: `npm run build`
2. Connect GitHub to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`

### Deploy to Self-Hosted Server

1. Build: `npm run build`
2. Install Node.js on server
3. Copy `node_modules`, `.next`, and `package.json`
4. Run: `npm start`
5. Use PM2 or similar for process management

## Performance Optimization

✅ Next.js automatic code splitting  
✅ Image optimization  
✅ CSS modules for scoped styling  
✅ Client-side routing  
✅ Server-side rendering capability  

## Security Considerations

⚠️ Current authentication is simplified for demo purposes

For production:
- Use NextAuth.js or Auth0
- Hash passwords with bcrypt
- Use secure JWT tokens
- Implement HTTPS
- Add CSRF protection
- Validate/sanitize all inputs
- Use environment variables for secrets

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Found Error
```bash
# Reinstall dependencies
npm install
```

### Clear Build Cache
```bash
# Remove build artifacts
rm -rf .next
npm run dev
```

### Local Storage Issues
- Clear browser localStorage if login stuck
- Use incognito mode to test fresh session

## Future Development

Possible enhancements:
- Real-time notifications
- Video streaming integration
- Advanced search/filtering
- Recommendation engine
- Discussion forums
- Mobile app
- Payment processing
- Automated certificate generation
- Live class scheduling
- Automated grading

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MDN Web Docs](https://developer.mozilla.org)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

## License

MIT License - Free to use and modify

## Credits

Built with:
- Next.js 14
- React 18
- TypeScript
- CSS Modules
- React Icons

---

**Ready to launch?** Start with `npm run dev` and explore all features!
