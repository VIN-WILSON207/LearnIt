"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = exports.getProgress = exports.updateProgress = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const updateProgress = async (req, res) => {
    try {
        const { courseId, percent } = req.body;
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const progress = await prisma_1.default.progress.upsert({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            update: { percent, updatedAt: new Date() },
            create: { studentId, courseId, percent },
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
exports.updateProgress = updateProgress;
const getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const progress = await prisma_1.default.progress.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId: String(courseId),
                },
            },
        });
        res.json(progress || { percent: 0 });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};
exports.getProgress = getProgress;
const getUserProgress = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const progress = await prisma_1.default.progress.findMany({
            where: { studentId },
            include: { course: { include: { subject: true } } },
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};
exports.getUserProgress = getUserProgress;
