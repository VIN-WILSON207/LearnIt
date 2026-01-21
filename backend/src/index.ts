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
import path from 'path';

dotenv.config();

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
