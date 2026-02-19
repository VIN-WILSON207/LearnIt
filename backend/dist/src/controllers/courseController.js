"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCourseUnpublish = exports.submitCourseUpdates = exports.getAllCourses = exports.getCourseById = exports.getInstructorCourses = exports.uploadLesson = exports.createCourse = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createCourse = async (req, res) => {
    try {
        let { title, description, subjectId, instructorId } = req.body;
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (role === 'INSTRUCTOR') {
            instructorId = userId;
        }
        if (!title || !subjectId || !instructorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const course = await prisma_1.default.course.create({
            data: { title, description, subjectId, instructorId }
        });
        res.status(201).json(course);
    }
    catch (error) {
        console.error('Failed to create course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};
exports.createCourse = createCourse;
const canManageCourse = (role, courseInstructorId, userId) => {
    if (!role)
        return false;
    if (role === 'ADMIN')
        return true;
    if (role === 'INSTRUCTOR' && courseInstructorId && userId) {
        return courseInstructorId === userId;
    }
    return false;
};
const uploadLesson = async (req, res) => {
    try {
        const { courseId, title, content, orderNumber, isFree } = req.body;
        const files = req.files;
        if (!courseId || !title) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        let videoUrl = null;
        let attachmentUrl = null;
        if (files) {
            if (files['video'] && files['video'][0]) {
                videoUrl = files['video'][0].path || files['video'][0].secure_url;
            }
            if (files['attachment'] && files['attachment'][0]) {
                attachmentUrl = files['attachment'][0].path || files['attachment'][0].secure_url;
            }
        }
        const lesson = await prisma_1.default.lesson.create({
            data: {
                courseId,
                title,
                content,
                videoUrl,
                attachmentUrl,
                orderNumber: parseInt(orderNumber) || 1,
                isFree: isFree === 'true',
            }
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        console.error('Failed to upload lesson:', error);
        res.status(500).json({ error: 'Failed to upload lesson' });
    }
};
exports.uploadLesson = uploadLesson;
const getInstructorCourses = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const courses = await prisma_1.default.course.findMany({
            where: { instructorId: String(instructorId) },
            include: { subject: true, lessons: true }
        });
        res.json(courses);
    }
    catch (error) {
        console.error('Failed to fetch instructor courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
const getCourseById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;
        const course = await prisma_1.default.course.findUnique({
            where: { id },
            include: {
                subject: true,
                lessons: {
                    orderBy: { orderNumber: 'asc' }
                },
                instructor: {
                    select: { name: true }
                }
            }
        });
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        const isOwner = course.instructorId === userId;
        if (role === 'STUDENT' && !course.isPublished) {
            return res.status(403).json({ error: 'This course is not approved for student access yet' });
        }
        if (role === 'INSTRUCTOR' && !course.isPublished && !isOwner) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!role && !course.isPublished) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json(course);
    }
    catch (error) {
        console.error('Failed to fetch course detail:', error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
};
exports.getCourseById = getCourseById;
const getAllCourses = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { status } = req.query;
        let whereClause = {};
        if (role === 'STUDENT' && userId) {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { levelId: true }
            });
            if (user?.levelId) {
                whereClause.subject = {
                    levelId: user.levelId
                };
            }
            whereClause.isPublished = true;
        }
        else if (role === 'INSTRUCTOR' && userId) {
            whereClause.instructorId = userId;
        }
        if (status === 'pending') {
            whereClause.isPublished = false;
        }
        else if (status === 'published') {
            whereClause.isPublished = true;
        }
        const courses = await prisma_1.default.course.findMany({
            where: whereClause,
            include: {
                subject: true,
                instructor: {
                    select: { name: true }
                }
            }
        });
        res.json(courses);
    }
    catch (error) {
        console.error('Failed to fetch all courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getAllCourses = getAllCourses;
const submitCourseUpdates = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { title, description } = req.body;
        const course = await prisma_1.default.course.findUnique({ where: { id } });
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        if (!canManageCourse(role, course.instructorId, userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const nextTitle = typeof title === 'string' ? title.trim() : '';
        const nextDescription = typeof description === 'string' ? description.trim() : '';
        if (!nextTitle) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const updatedCourse = await prisma_1.default.course.update({
            where: { id },
            data: {
                title: nextTitle,
                description: nextDescription || null,
                // Any instructor update goes back to pending until admin re-approves.
                isPublished: false,
            },
        });
        await prisma_1.default.supportMessage.create({
            data: {
                userId: String(userId),
                subject: `Course Update Review Request: ${updatedCourse.title}`,
                message: `Course ID: ${updatedCourse.id}\nInstructor ID: ${userId}\nRequest: Please review and approve the submitted course updates.`,
                status: 'OPEN',
            },
        });
        res.status(200).json({
            message: 'Updates submitted for admin review',
            course: updatedCourse,
        });
    }
    catch (error) {
        console.error('Failed to submit course updates:', error);
        res.status(500).json({ error: 'Failed to submit updates' });
    }
};
exports.submitCourseUpdates = submitCourseUpdates;
const requestCourseUnpublish = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;
        const reason = String(req.body?.reason || '').trim();
        if (reason.length < 15) {
            return res.status(400).json({ error: 'Please provide a valid unpublish reason (at least 15 characters)' });
        }
        const course = await prisma_1.default.course.findUnique({ where: { id } });
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        if (!canManageCourse(role, course.instructorId, userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await prisma_1.default.supportMessage.create({
            data: {
                userId: String(userId),
                subject: `Course Unpublish Request: ${course.title}`,
                message: `Course ID: ${course.id}\nInstructor ID: ${userId}\nReason: ${reason}`,
                status: 'OPEN',
            },
        });
        res.status(200).json({
            message: 'Unpublish request submitted to admin for review',
        });
    }
    catch (error) {
        console.error('Failed to request course unpublish:', error);
        res.status(500).json({ error: 'Failed to submit unpublish request' });
    }
};
exports.requestCourseUnpublish = requestCourseUnpublish;
