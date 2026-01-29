import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import quizRoutes from './routes/quizRoutes';
import progressRoutes from './routes/progressRoutes';
import certificateRoutes from './routes/certificateRoutes';
import forumRoutes from './routes/forumRoutes';
import supportRoutes from './routes/supportRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import path from 'path';

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const optionalEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ CRITICAL: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Warn about optional but recommended env vars
optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  WARNING: Missing optional environment variable: ${envVar}`);
    console.warn(`   File uploads will not work without Cloudinary credentials`);
  }
});

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.send('LEARNIT API Running');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error("DEBUG: Global Error Handler Caught:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});

// Start server
app.listen(port, () => {
    console.log(`LEARNIT running on port ${port}`);
});
