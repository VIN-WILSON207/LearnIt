# Learning Management System (LMS) Platform

A modern, responsive Learning Management System built with Next.js, featuring role-based access control for students, professors, and administrators.

## Features

### 🧑‍🎓 Student Dashboard
- View enrolled courses with progress tracking
- Track learning hours completed
- View earned certificates and badges
- Access learning materials (videos, PDFs, tutorials)
- Monitor course progress with visual progress bars

### 👨‍🏫 Professor Dashboard
- Create and manage courses
- Upload learning materials
- View student enrollments and progress
- Track course performance and ratings
- Manage course materials and assignments

### 🛡️ Admin Dashboard
- User management (add, edit, delete users)
- Course approval and management
- Platform analytics and statistics
- View platform-wide learning metrics
- Monitor user engagement and completion rates

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** CSS Modules
- **State Management:** React Context API
- **Authentication:** Role-based login system
- **Database:** Mock data (easily replaceable with MongoDB or PostgreSQL)
- **Icons:** React Icons

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── api/                   # API routes
│   │   ├── auth/login/        # Authentication endpoint
│   │   ├── courses/           # Course endpoints
│   │   ├── enrollments/       # Enrollment endpoints
│   │   ├── users/             # User endpoints
│   │   └── analytics/         # Analytics endpoints
│   ├── student/
│   │   └── dashboard/         # Student dashboard
│   ├── professor/
│   │   └── dashboard/         # Professor dashboard
│   ├── admin/
│   │   └── dashboard/         # Admin dashboard
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page (redirects to login)
├── components/
│   ├── Button.tsx             # Reusable button component
│   ├── Card.tsx               # Reusable card component
│   ├── Navbar.tsx             # Navigation bar
│   └── ProtectedRoute.tsx      # Route protection wrapper
├── context/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   └── mockData.ts            # Mock database
├── styles/
│   └── globals.css            # Global styles
└── public/                     # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Demo Credentials

Use these credentials to test different user roles:

### Student
- **Email:** student@example.com
- **Password:** student123

### Professor
- **Email:** professor@example.com
- **Password:** professor123

### Admin
- **Email:** admin@example.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Courses
- `GET /api/courses` - Fetch all courses
- `POST /api/courses` - Create a new course

### Enrollments
- `GET /api/enrollments` - Fetch enrollments
- `GET /api/enrollments?studentId=<id>` - Fetch student enrollments
- `POST /api/enrollments` - Create new enrollment

### Users
- `GET /api/users` - Fetch all users
- `GET /api/users?role=<role>` - Fetch users by role

### Analytics
- `GET /api/analytics` - Fetch platform analytics

## Features Implemented

✅ Role-based authentication (Student, Professor, Admin)  
✅ Protected routes with automatic redirection  
✅ Student dashboard with course tracking  
✅ Professor course management interface  
✅ Admin user and course management  
✅ Platform analytics dashboard  
✅ Responsive mobile-friendly design  
✅ Clean, professional UI  
✅ Mock data for demonstration  

## Customization

### Adding Real Database
1. Replace `mockData.ts` with actual database queries
2. Update API routes to use your database
3. Consider using MongoDB, PostgreSQL, or Firebase

### Adding Authentication
Replace the mock authentication with:
- NextAuth.js
- Auth0
- Firebase Authentication
- Custom JWT-based auth

### Styling
The project uses CSS Modules. You can:
- Customize colors in `styles/globals.css`
- Modify component styles in individual `.module.css` files
- Add CSS-in-JS solution (Tailwind, Styled Components, etc.)

## Build for Production

```bash
npm run build
npm start
```

## Deployment

This project can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS
- Heroku
- Docker

## Responsive Design

The platform is fully responsive and tested on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Video player integration
- Real-time notifications
- Messaging between students and professors
- Advanced search and filtering
- Course recommendations
- Mobile app
- Payment integration
- Automated certificate generation
- Discussion forums
- Live class scheduling

## License

MIT License - Feel free to use this project for your own purposes.

## Support

For issues or questions, please refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)

## Contributing

Contributions are welcome! Feel free to submit pull requests and suggest improvements.

---

Built with ❤️ using Next.js
