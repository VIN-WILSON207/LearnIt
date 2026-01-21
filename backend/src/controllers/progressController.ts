import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const updateProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, percent } = req.body;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await prisma.progress.upsert({
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await prisma.progress.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId: String(courseId),
                },
            },
        });

        res.json(progress || { percent: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};

export const getUserProgress = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await prisma.progress.findMany({
            where: { studentId },
            include: { course: { include: { subject: true } } },
        });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};