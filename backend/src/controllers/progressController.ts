import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateDynamicCertificateUrl } from '../utils/certificateUtils';

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

        if (percent >= 100) {
            const existingCert = await prisma.certificate.findFirst({
                where: {
                    studentId: studentId,
                    courseId,
                },
            });

            if (!existingCert) {
                const student = await prisma.user.findUnique({ where: { id: studentId } });
                const course = await prisma.course.findUnique({ where: { id: courseId } });

                if (student && course) {
                    const dateString = new Date().toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });

                    const fileUrl = generateDynamicCertificateUrl(
                        student.name,
                        course.title,
                        dateString
                    );

                    await prisma.certificate.create({
                        data: {
                            studentId: studentId,
                            courseId,
                            issueDate: new Date(),
                            fileUrl,
                        },
                    });
                }
            }
        }

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