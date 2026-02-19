import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const getQuizStats = async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId as string },
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const totalAttempts = await prisma.quizAttempt.count({
            where: { quizId: quizId as string },
        });

        const avgScore = await prisma.quizAttempt.aggregate({
            where: { quizId: quizId as string },
            _avg: { score: true },
            _max: { score: true },
            _min: { score: true },
        });

        const passRate =
            (await prisma.quizAttempt.count({
                where: {
                    quizId: quizId as string,
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
    } catch (error) {
        console.error('Failed to fetch quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch quiz stats' });
    }
};

export const getUserQuizStats = async (req: AuthRequest, res: Response) => {
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

        const quizResults = await prisma.quizAttempt.findMany({
            where: { studentId: userId as string },
            include: {
                quiz: true,
            },
            orderBy: { attemptedAt: 'desc' },
        });

        const totalQuizzesAttempted = quizResults.length;
        const avgScore =
            quizResults.reduce((sum: number, result: any) => sum + result.score, 0) /
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
    } catch (error) {
        console.error('Failed to fetch user quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch user quiz stats' });
    }
};

export const getCourseQuizStats = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const lessons = await prisma.lesson.findMany({
            where: { courseId: courseId as string },
            include: {
                quiz: true,
            },
        });

        const stats = await Promise.all(
            lessons.map(async (lesson) => {
                if (!lesson.quiz) return null;

                const results = await prisma.quizAttempt.findMany({
                    where: { quizId: lesson.quiz.id },
                });

                const avgScore =
                    results.reduce((sum: number, result: any) => sum + result.score, 0) /
                    (results.length || 1);

                return {
                    quizId: lesson.quiz.id,
                    lessonTitle: lesson.title,
                    totalAttempts: results.length,
                    avgScore: avgScore.toFixed(2),
                    passMark: lesson.quiz.passMark,
                };
            })
        );

        res.status(200).json({
            courseId,
            quizzes: stats.filter((q) => q !== null),
        });
    } catch (error) {
        console.error('Failed to fetch course quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch course quiz stats' });
    }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const topUsers = await prisma.quizAttempt.groupBy({
            by: ['studentId'],
            _avg: { score: true },
            orderBy: {
                _avg: {
                    score: 'desc',
                },
            },
            take: limit,
        });

        const leaderboard = await Promise.all(
            topUsers.map(async (entry: any) => {
                const user = await prisma.user.findUnique({
                    where: { id: entry.studentId },
                    select: { id: true, name: true, email: true },
                });

                return {
                    user,
                    avgScore: entry._avg.score || 0,
                };
            })
        );

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
