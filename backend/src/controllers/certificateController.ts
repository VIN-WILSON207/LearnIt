import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const generateCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        // Check progress
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

        // Check if already has certificate
        const existing = await prisma.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });

        if (existing) return res.json(existing);

        // Generate certificate 
        const fileUrl = `https://example.com/certificates/${studentId}-${courseId}.pdf`;

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