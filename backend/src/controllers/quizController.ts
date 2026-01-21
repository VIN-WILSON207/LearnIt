import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const getQuiz = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { lessonId: String(lessonId) },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

export const submitQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { quizId, answers } = req.body; 
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } },
        });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        let score = 0;
        for (const question of quiz.questions) {
            const selectedOptionId = answers[question.id];
            const selectedOption = question.options.find(o => o.id === selectedOptionId);
            if (selectedOption?.isCorrect) score++;
        }

        const passed = score >= quiz.passMark;

        const attempt = await prisma.quizAttempt.create({
            data: {
                studentId,
                quizId,
                score,
                passed,
            },
        });

        res.json({ attempt, score, passed });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};

export const getQuizAttempts = async (req: AuthRequest, res: Response) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const attempts = await prisma.quizAttempt.findMany({
            where: { studentId, quizId: String(quizId) },
            orderBy: { attemptedAt: 'desc' },
        });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};