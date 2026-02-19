import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const createEnrollment = async (req: AuthRequest, res: Response) => {
    try {
        let { studentId, courseId } = req.body;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (role === 'STUDENT') {
            studentId = userId;
        }

        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existing = await prisma.enrollment.findFirst({
            where: { studentId, courseId },
        });

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { subject: true }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.isPublished) {
            return res.status(403).json({ error: 'This course is pending admin approval and cannot be enrolled yet' });
        }

        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { levelId: true, role: true }
        });

        if (student?.role === 'STUDENT' && student.levelId !== course.subject.levelId) {
            return res.status(403).json({ error: 'You can only enroll in courses matching your academic level' });
        }

        const enrollment = await prisma.enrollment.create({
            data: { studentId, courseId },
            include: { course: true, student: true },
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create enrollment' });
    }
};

export const getUserEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (role === 'STUDENT' && studentId !== userId) {
            return res.status(403).json({ error: 'Forbidden. You can only view your own enrollments.' });
        }

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: studentId as string },
            include: {
                course: {
                    include: {
                        instructor: true,
                        subject: true,
                    },
                },
            },
        });

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

export const getCourseEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: courseId as string },
            include: {
                student: true,
            },
        });

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

export const getInstructorEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const { instructorId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!instructorId) {
            return res.status(400).json({ error: 'Instructor ID is required' });
        }

        if (role === 'INSTRUCTOR' && instructorId !== userId) {
            return res.status(403).json({ error: 'Forbidden. You can only view your own enrollments.' });
        }

        const courses = await prisma.course.findMany({
            where: { instructorId: String(instructorId) },
            select: { id: true },
        });

        const courseIds = courses.map((c) => c.id);

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            include: {
                student: true,
                course: true,
            },
        });

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
export const removeEnrollment = async (req: AuthRequest, res: Response) => {
    try {
        const { enrollmentId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!enrollmentId) {
            return res.status(400).json({ error: 'Enrollment ID is required' });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId as string }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        if (role !== 'ADMIN' && enrollment.studentId !== userId) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to remove this enrollment.' });
        }

        await prisma.enrollment.delete({
            where: { id: enrollmentId as string },
        });

        res.status(200).json({ message: 'Enrollment removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove enrollment' });
    }
};

export const getAllEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                student: true,
                course: true,
            },
        });

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
