"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCourses = exports.getCourseById = exports.getInstructorCourses = exports.uploadLesson = exports.createCourse = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const fs_1 = __importDefault(require("fs"));

const deleteFile = (filePath) => {
    fs_1.default.unlink(filePath, (err) => {
        if (err)
            console.error("Failed to delete file:", err);
    });
};
const createCourse = async (req, res) => {
    try {
        const { title, description, subjectId, instructorId } = req.body;
        if (!title || !subjectId || !instructorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const course = await prisma_1.default.course.create({
            data: {
                title,
                description,
                subjectId,
                instructorId,
            }
        });
        res.status(201).json(course);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};
exports.createCourse = createCourse;
const uploadLesson = async (req, res) => {
    try {
        const { courseId, title, content, orderNumber, isFree } = req.body;
        const file = req.file;
        if (!courseId || !title) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        let videoUrl = null;
        if (file) {
            videoUrl = file.path;
        }
        const lesson = await prisma_1.default.lesson.create({
            data: {
                courseId,
                title,
                content,
                videoUrl,
                orderNumber: parseInt(orderNumber) || 1,
                isFree: isFree === 'true',
            }
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        console.error(error);
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
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
const getCourseById = async (req, res) => {
    try {
        const id = String(req.params.id);
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
        res.json(course);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
};
exports.getCourseById = getCourseById;
const getAllCourses = async (req, res) => {
    try {
        const courses = await prisma_1.default.course.findMany({
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
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getAllCourses = getAllCourses;
