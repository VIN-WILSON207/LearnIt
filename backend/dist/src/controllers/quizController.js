"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizAttempts = exports.submitQuiz = exports.getQuiz = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
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
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};
exports.getQuizAttempts = getQuizAttempts;
