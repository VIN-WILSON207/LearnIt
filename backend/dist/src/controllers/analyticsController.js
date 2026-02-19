"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngagementMetrics = exports.getUserAnalytics = exports.getCourseAnalytics = exports.getOverallAnalytics = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getOverallAnalytics = async (req, res) => {
    try {
        const [totalUsers, totalCourses, pendingCourses, activeSubscriptions, recentUsers] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.course.count(),
            prisma_1.default.course.count({ where: { isPublished: false } }),
            prisma_1.default.subscription.count({ where: { isActive: true, endDate: { gte: new Date() } } }),
            prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Failed to fetch overall analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getOverallAnalytics = getOverallAnalytics;
const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (role === 'INSTRUCTOR' && course.instructorId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const enrollmentCount = await prisma_1.default.enrollment.count({
            where: { courseId: courseId },
        });
        const avgProgress = await prisma_1.default.progress.aggregate({
            where: { courseId: courseId },
            _avg: { percent: true },
        });
        res.status(200).json({
            courseId,
            courseName: course.title,
            enrollmentCount,
            avgCompletionPercentage: avgProgress._avg.percent || 0,
        });
    }
    catch (error) {
        console.error('Failed to fetch course analytics:', error);
        res.status(500).json({ error: 'Failed to fetch course analytics' });
    }
};
exports.getCourseAnalytics = getCourseAnalytics;
const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const enrolledCourses = await prisma_1.default.enrollment.count({
            where: { studentId: userId },
        });
        const completedCourses = await prisma_1.default.progress.count({
            where: {
                studentId: userId,
                percent: 100,
            },
        });
        const totalQuizzesAttempted = await prisma_1.default.quizAttempt.count({
            where: { studentId: userId },
        });
        const avgQuizScore = await prisma_1.default.quizAttempt.aggregate({
            where: { studentId: userId },
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
    }
    catch (error) {
        console.error('Failed to fetch user analytics:', error);
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
};
exports.getUserAnalytics = getUserAnalytics;
const getEngagementMetrics = async (req, res) => {
    try {
        const activeUsers = await prisma_1.default.progress.groupBy({
            by: ['studentId'],
        });
        const totalProgress = await prisma_1.default.progress.count();
        const completedProgress = await prisma_1.default.progress.count({
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
    }
    catch (error) {
        console.error('Failed to fetch engagement metrics:', error);
        res.status(500).json({ error: 'Failed to fetch engagement metrics' });
    }
};
exports.getEngagementMetrics = getEngagementMetrics;
