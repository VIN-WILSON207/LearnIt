"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEnrollments = exports.removeEnrollment = exports.getInstructorEnrollments = exports.getCourseEnrollments = exports.getUserEnrollments = exports.createEnrollment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createEnrollment = async (req, res) => {
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
        const existing = await prisma_1.default.enrollment.findFirst({
            where: { studentId, courseId },
        });
        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId },
            include: { subject: true }
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (!course.isPublished) {
            return res.status(403).json({ error: 'This course is pending admin approval and cannot be enrolled yet' });
        }
        const student = await prisma_1.default.user.findUnique({
            where: { id: studentId },
            select: { levelId: true, role: true }
        });
        if (student?.role === 'STUDENT' && student.levelId !== course.subject.levelId) {
            return res.status(403).json({ error: 'You can only enroll in courses matching your academic level' });
        }
        const enrollment = await prisma_1.default.enrollment.create({
            data: { studentId, courseId },
            include: { course: true, student: true },
        });
        res.status(201).json(enrollment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create enrollment' });
    }
};
exports.createEnrollment = createEnrollment;
const getUserEnrollments = async (req, res) => {
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
        const enrollments = await prisma_1.default.enrollment.findMany({
            where: { studentId: studentId },
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getUserEnrollments = getUserEnrollments;
const getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const enrollments = await prisma_1.default.enrollment.findMany({
            where: { courseId: courseId },
            include: {
                student: true,
            },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getCourseEnrollments = getCourseEnrollments;
const getInstructorEnrollments = async (req, res) => {
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
        const courses = await prisma_1.default.course.findMany({
            where: { instructorId: String(instructorId) },
            select: { id: true },
        });
        const courseIds = courses.map((c) => c.id);
        const enrollments = await prisma_1.default.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            include: {
                student: true,
                course: true,
            },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getInstructorEnrollments = getInstructorEnrollments;
const removeEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!enrollmentId) {
            return res.status(400).json({ error: 'Enrollment ID is required' });
        }
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId }
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        if (role !== 'ADMIN' && enrollment.studentId !== userId) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to remove this enrollment.' });
        }
        await prisma_1.default.enrollment.delete({
            where: { id: enrollmentId },
        });
        res.status(200).json({ message: 'Enrollment removed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove enrollment' });
    }
};
exports.removeEnrollment = removeEnrollment;
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma_1.default.enrollment.findMany({
            include: {
                student: true,
                course: true,
            },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getAllEnrollments = getAllEnrollments;
