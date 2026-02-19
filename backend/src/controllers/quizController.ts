import { Response, Request } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const createQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId, passMark, questions } = req.body;

        if (!lessonId || passMark === undefined || !questions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const quiz = await prisma.quiz.create({
            data: {
                lessonId,
                passMark: parseInt(passMark),
                questions: {
                    create: questions.map((q: any) => ({
                        text: q.text,
                        options: {
                            create: q.options.map((o: any) => ({
                                text: o.text,
                                isCorrect: o.isCorrect
                            }))
                        }
                    }))
                }
            },
            include: {
                questions: {
                    include: { options: true }
                }
            }
        });

        res.status(201).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};

export const updateQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const { passMark, questions } = req.body;

        await prisma.quiz.update({
            where: { id },
            data: { passMark: parseInt(passMark) }
        });

        await prisma.question.deleteMany({ where: { quizId: id } });

        const updatedQuiz = await prisma.quiz.update({
            where: { id },
            data: {
                questions: {
                    create: questions.map((q: any) => ({
                        text: q.text,
                        options: {
                            create: q.options.map((o: any) => ({
                                text: o.text,
                                isCorrect: o.isCorrect
                            }))
                        }
                    }))
                }
            },
            include: {
                questions: {
                    include: { options: true }
                }
            }
        });

        res.json(updatedQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        await prisma.quiz.delete({ where: { id } });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};

export const getQuiz = async (req: AuthRequest, res: Response) => {
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
        console.error('Failed to fetch quiz:', error);
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
        console.error('Failed to submit quiz:', error);
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
        console.error('Failed to fetch quiz attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};