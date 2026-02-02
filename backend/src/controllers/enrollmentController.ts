import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const getEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.query.studentId as string | undefined;
        const userId = req.user?.userId;

        // If studentId is provided, check if user is admin or the student themselves
        if (studentId && userId !== studentId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // If no studentId, use authenticated user's ID (for students) or return all (for admins)
        const whereClause = req.user?.role === 'ADMIN'
            ? (studentId ? { studentId } : {})
            : { studentId: userId };

        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            include: {
                course: {
                    include: {
                        subject: true,
                        instructor: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user?.userId;

        if (!studentId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (req.user?.role !== 'STUDENT') {
            return res.status(403).json({ error: 'Only students can enroll in courses' });
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                studentId,
                courseId,
            },
            include: {
                course: {
                    include: {
                        subject: true,
                        instructor: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
};
