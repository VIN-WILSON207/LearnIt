import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateDynamicCertificateUrl } from '../utils/certificateUtils';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const generateCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await prisma.progress.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });

        if (!progress || progress.percent < 100) {
            return res.status(400).json({ error: 'Course not completed' });
        }

        const existing = await prisma.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });

        if (existing) return res.json(existing);

        const student = await prisma.user.findUnique({ where: { id: studentId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!student || !course) {
            return res.status(404).json({ error: 'Student or Course not found' });
        }

        const dateString = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const fileUrl = generateDynamicCertificateUrl(
            student.name,
            course.title,
            dateString
        );

        const certificate = await prisma.certificate.create({
            data: {
                studentId,
                courseId,
                issueDate: new Date(),
                fileUrl,
            },
        });

        res.status(201).json(certificate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};

export const getCertificates = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const certificates = await prisma.certificate.findMany({
            where: { studentId },
            include: { course: true },
        });

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

export const adminIssueCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'Student ID and Course ID are required' });
        }

        const existing = await prisma.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'Certificate already exists' });
        }

        const student = await prisma.user.findUnique({ where: { id: studentId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!student || !course) {
            return res.status(404).json({ error: 'Student or Course not found' });
        }

        const dateString = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const fileUrl = generateDynamicCertificateUrl(
            student.name,
            course.title,
            dateString
        );

        const certificate = await prisma.certificate.create({
            data: {
                studentId,
                courseId,
                issueDate: new Date(),
                fileUrl,
            },
            include: { student: true, course: true },
        });

        res.status(201).json(certificate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to issue certificate' });
    }
};

export const getAllCertificates = async (req: AuthRequest, res: Response) => {
    try {
        const certificates = await prisma.certificate.findMany({
            include: {
                student: {
                    select: { id: true, name: true, email: true },
                },
                course: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { issueDate: 'desc' },
        });

        res.json(certificates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

export const downloadCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const certificate = await prisma.certificate.findUnique({
            where: { id },
        });

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        if (certificate.studentId !== userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (req.user?.role !== 'ADMIN') {
            const activeSubscription = await prisma.subscription.findFirst({
                where: {
                    studentId: userId,
                    isActive: true,
                    endDate: { gte: new Date() }
                }
            });

            if (!activeSubscription) {
                return res.status(403).json({
                    error: 'Subscription required',
                    code: 'SUBSCRIPTION_REQUIRED'
                });
            }
        }

        res.json({ downloadUrl: certificate.fileUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download certificate' });
    }
};