"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizAttempts = exports.submitQuiz = exports.getQuiz = exports.deleteQuiz = exports.updateQuiz = exports.createQuiz = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createQuiz = async (req, res) => {
    try {
        const { lessonId, passMark, questions } = req.body;
        if (!lessonId || passMark === undefined || !questions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const quiz = await prisma_1.default.quiz.create({
            data: {
                lessonId,
                passMark: parseInt(passMark),
                questions: {
                    create: questions.map((q) => ({
                        text: q.text,
                        options: {
                            create: q.options.map((o) => ({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};
exports.createQuiz = createQuiz;
const updateQuiz = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { passMark, questions } = req.body;
        await prisma_1.default.quiz.update({
            where: { id },
            data: { passMark: parseInt(passMark) }
        });
        await prisma_1.default.question.deleteMany({ where: { quizId: id } });
        const updatedQuiz = await prisma_1.default.quiz.update({
            where: { id },
            data: {
                questions: {
                    create: questions.map((q) => ({
                        text: q.text,
                        options: {
                            create: q.options.map((o) => ({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};
exports.updateQuiz = updateQuiz;
const deleteQuiz = async (req, res) => {
    try {
        const id = String(req.params.id);
        await prisma_1.default.quiz.delete({ where: { id } });
        res.json({ message: 'Quiz deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};
exports.deleteQuiz = deleteQuiz;
const getQuiz = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { lessonId: String(lessonId) },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    }
    catch (error) {
        console.error('Failed to fetch quiz:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};
exports.getQuiz = getQuiz;
const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } },
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        let score = 0;
        for (const question of quiz.questions) {
            const selectedOptionId = answers[question.id];
            const selectedOption = question.options.find(o => o.id === selectedOptionId);
            if (selectedOption?.isCorrect)
                score++;
        }
        const passed = score >= quiz.passMark;
        const attempt = await prisma_1.default.quizAttempt.create({
            data: {
                studentId,
                quizId,
                score,
                passed,
            },
        });
        res.json({ attempt, score, passed });
    }
    catch (error) {
        console.error('Failed to submit quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};
exports.submitQuiz = submitQuiz;
const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const attempts = await prisma_1.default.quizAttempt.findMany({
            where: { studentId, quizId: String(quizId) },
            orderBy: { attemptedAt: 'desc' },
        });
        res.json(attempts);
    }
    catch (error) {
        console.error('Failed to fetch quiz attempts:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};
exports.getQuizAttempts = getQuizAttempts;
