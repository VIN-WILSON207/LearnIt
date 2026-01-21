
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

// Helper to delete file if DB op fails
const deleteFile = (filePath: string) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
    });
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, subjectId, instructorId } = req.body;
        // Basic validation
        if (!title || !subjectId || !instructorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                subjectId,
                instructorId,
            }
        });
        res.status(201).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const uploadLesson = async (req: Request, res: Response) => {
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

        const lesson = await prisma.lesson.create({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload lesson' });
    }
};

export const getInstructorCourses = async (req: Request, res: Response) => {
    try {
        const { instructorId } = req.params;
        const courses = await prisma.course.findMany({
            where: { instructorId: String(instructorId) },
            include: { subject: true, lessons: true }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const course = await prisma.course.findUnique({
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

        if (!course) return res.status(404).json({ error: 'Course not found' });

        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
};

export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                subject: true,
                instructor: {
                    select: { name: true }
                }
            }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
