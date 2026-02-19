import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import quizRoutes from './routes/quizRoutes';
import progressRoutes from './routes/progressRoutes';
import certificateRoutes from './routes/certificateRoutes';
import forumRoutes from './routes/forumRoutes';
import supportRoutes from './routes/supportRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import usersRoutes from './routes/usersRoutes';
import configRoutes from './routes/configRoutes';
import quizStatsRoutes from './routes/quizStatsRoutes';
import adminRoutes from './routes/adminRoutes';
import adminSubscriptionRoutes from './routes/adminSubscriptionRoutes';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/config', configRoutes);
app.use('/api/quiz-stats', quizStatsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.send('LEARNIT API Running');
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});

// Start server
app.listen(port, () => {
    console.log(`LEARNIT running on port ${port}`);
});
