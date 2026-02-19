"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.getCourseQuizStats = exports.getUserQuizStats = exports.getQuizStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getQuizStats = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id: quizId },
        });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const totalAttempts = await prisma_1.default.quizAttempt.count({
            where: { quizId: quizId },
        });
        const avgScore = await prisma_1.default.quizAttempt.aggregate({
            where: { quizId: quizId },
            _avg: { score: true },
            _max: { score: true },
            _min: { score: true },
        });
        const passRate = (await prisma_1.default.quizAttempt.count({
            where: {
                quizId: quizId,
                score: {
                    gte: quiz.passMark,
                },
            },
        })) / (totalAttempts || 1);
        res.status(200).json({
            quizId,
            quizPassMark: quiz.passMark,
            totalAttempts,
            avgScore: avgScore._avg.score || 0,
            maxScore: avgScore._max.score || 0,
            minScore: avgScore._min.score || 0,
            passRate: (passRate * 100).toFixed(2),
        });
    }
    catch (error) {
        console.error('Failed to fetch quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch quiz stats' });
    }
};
exports.getQuizStats = getQuizStats;
const getUserQuizStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const authId = req.user?.userId;
        const role = req.user?.role;
        if (role === 'STUDENT' && userId !== authId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const quizResults = await prisma_1.default.quizAttempt.findMany({
            where: { studentId: userId },
            include: {
                quiz: true,
            },
            orderBy: { attemptedAt: 'desc' },
        });
        const totalQuizzesAttempted = quizResults.length;
        const avgScore = quizResults.reduce((sum, result) => sum + result.score, 0) /
            (totalQuizzesAttempted || 1);
        const passedQuizzes = quizResults.filter((result) => result.score >= result.quiz.passMark);
        res.status(200).json({
            userId,
            totalQuizzesAttempted,
            passedQuizzes: passedQuizzes.length,
            failedQuizzes: totalQuizzesAttempted - passedQuizzes.length,
            avgScore: avgScore.toFixed(2),
            quizResults,
        });
    }
    catch (error) {
        console.error('Failed to fetch user quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch user quiz stats' });
    }
};
exports.getUserQuizStats = getUserQuizStats;
const getCourseQuizStats = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const lessons = await prisma_1.default.lesson.findMany({
            where: { courseId: courseId },
            include: {
                quiz: true,
            },
        });
        const stats = await Promise.all(lessons.map(async (lesson) => {
            if (!lesson.quiz)
                return null;
            const results = await prisma_1.default.quizAttempt.findMany({
                where: { quizId: lesson.quiz.id },
            });
            const avgScore = results.reduce((sum, result) => sum + result.score, 0) /
                (results.length || 1);
            return {
                quizId: lesson.quiz.id,
                lessonTitle: lesson.title,
                totalAttempts: results.length,
                avgScore: avgScore.toFixed(2),
                passMark: lesson.quiz.passMark,
            };
        }));
        res.status(200).json({
            courseId,
            quizzes: stats.filter((q) => q !== null),
        });
    }
    catch (error) {
        console.error('Failed to fetch course quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch course quiz stats' });
    }
};
exports.getCourseQuizStats = getCourseQuizStats;
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topUsers = await prisma_1.default.quizAttempt.groupBy({
            by: ['studentId'],
            _avg: { score: true },
            orderBy: {
                _avg: {
                    score: 'desc',
                },
            },
            take: limit,
        });
        const leaderboard = await Promise.all(topUsers.map(async (entry) => {
            const user = await prisma_1.default.user.findUnique({
                where: { id: entry.studentId },
                select: { id: true, name: true, email: true },
            });
            return {
                user,
                avgScore: entry._avg.score || 0,
            };
        }));
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
exports.getLeaderboard = getLeaderboard;
