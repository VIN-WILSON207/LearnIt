import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const getPlatformAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Get total counts
        const [
            totalUsers,
            totalStudents,
            totalInstructors,
            totalCourses,
            totalEnrollments,
            totalCertificates,
            activeSubscriptions
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            prisma.course.count(),
            prisma.enrollment.count(),
            prisma.certificate.count(),
            prisma.subscription.count({
                where: {
                    isActive: true,
                    endDate: { gte: new Date() }
                }
            })
        ]);

        // Calculate completion rate
        const totalProgress = await prisma.progress.findMany({
            select: { percent: true }
        });
        const averageProgress = totalProgress.length > 0
            ? totalProgress.reduce((sum, p) => sum + p.percent, 0) / totalProgress.length
            : 0;

        // Get subscription breakdown
        const subscriptions = await prisma.subscription.findMany({
            where: {
                isActive: true,
                endDate: { gte: new Date() }
            },
            include: { plan: true }
        });

        const subscribedUsers = {
            free: subscriptions.filter(s => s.plan.name.toLowerCase() === 'free').length,
            basic: subscriptions.filter(s => s.plan.name.toLowerCase() === 'basic').length,
            pro: subscriptions.filter(s => s.plan.name.toLowerCase() === 'pro').length,
        };

        // Calculate active users (users who logged in within last 30 days)
        // Note: This is a simplified version. In production, you'd track last login
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await prisma.user.count({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        const analytics = {
            totalUsers,
            activeUsers,
            totalInstructors,
            totalCourses,
            averageCompletion: Math.round(averageProgress),
            totalEnrollments,
            certificatesIssued: totalCertificates,
            subscribedUsers,
            totalStudents,
            activeSubscriptions
        };

        res.json(analytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
