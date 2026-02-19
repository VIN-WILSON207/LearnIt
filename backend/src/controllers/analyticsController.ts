import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const getOverallAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalUsers,
            totalCourses,
            pendingCourses,
            activeSubscriptions,
            recentUsers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.course.count({ where: { isPublished: false } }),
            prisma.subscription.count({ where: { isActive: true, endDate: { gte: new Date() } } }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, createdAt: true, role: true }
            })
        ]);

        const revenue30d = activeSubscriptions * 5000;

        res.status(200).json({
            totalUsers,
            totalCourses,
            pendingCoursesCount: pendingCourses,
            activeSubscriptions,
            revenue30d,
            recentActivity: recentUsers.map(u => ({
                id: u.id,
                type: 'USER_REGISTRATION',
                title: 'New User Joined',
                description: `${u.name} (${u.role.toLowerCase()}) signed up`,
                date: u.createdAt
            }))
        });
    } catch (error) {
        console.error('Failed to fetch overall analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export const getCourseAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId as string },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (role === 'INSTRUCTOR' && course.instructorId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const enrollmentCount = await prisma.enrollment.count({
            where: { courseId: courseId as string },
        });

        const avgProgress = await prisma.progress.aggregate({
            where: { courseId: courseId as string },
            _avg: { percent: true },
        });

        res.status(200).json({
            courseId,
            courseName: course.title,
            enrollmentCount,
            avgCompletionPercentage: avgProgress._avg.percent || 0,
        });
    } catch (error) {
        console.error('Failed to fetch course analytics:', error);
        res.status(500).json({ error: 'Failed to fetch course analytics' });
    }
};

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId as string },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const enrolledCourses = await prisma.enrollment.count({
            where: { studentId: userId as string },
        });

        const completedCourses = await prisma.progress.count({
            where: {
                studentId: userId as string,
                percent: 100,
            },
        });

        const totalQuizzesAttempted = await prisma.quizAttempt.count({
            where: { studentId: userId as string },
        });

        const avgQuizScore = await prisma.quizAttempt.aggregate({
            where: { studentId: userId as string },
            _avg: { score: true },
        });

        res.status(200).json({
            userId,
            userName: user.name,
            enrolledCourses,
            completedCourses,
            totalQuizzesAttempted,
            avgQuizScore: avgQuizScore._avg.score || 0,
        });
    } catch (error) {
        console.error('Failed to fetch user analytics:', error);
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
};

export const getEngagementMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const activeUsers = await prisma.progress.groupBy({
            by: ['studentId'],
        });

        const totalProgress = await prisma.progress.count();
        const completedProgress = await prisma.progress.count({
            where: { percent: 100 },
        });
        const completionRate = totalProgress > 0 ? completedProgress / totalProgress : 0;

        res.status(200).json({
            activeUsersCount: activeUsers.length,
            completionRate: (completionRate * 100).toFixed(2),
            platformMetrics: {
                totalDataPoints: totalProgress,
            },
        });
    } catch (error) {
        console.error('Failed to fetch engagement metrics:', error);
        res.status(500).json({ error: 'Failed to fetch engagement metrics' });
    }
};
