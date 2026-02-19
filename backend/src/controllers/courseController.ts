import { Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { handleError } from '../utils/errorHandler';
import { formatCourseURLs } from '../utils/formatters';

// Helper to delete file if DB op fails
const deleteFile = (filePath: string) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
    });
};

/* =========================================================
   CREATE COURSE
========================================================= */
export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, subjectId, instructorId } = req.body;
        // If file exists, use file.path which is the Cloudinary URL. 
        // fallback to /uploads/filename only if path is relative.
        let thumbnailUrl = null;
        if (req.file) {
            thumbnailUrl = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
        }

        if (!title || !subjectId || !instructorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const course = await prisma.course.create({
            data: {
                title,
                description: description || null,
                thumbnailUrl,
                subjectId,
                instructorId,
            },
            include: {
                subject: true,
                instructor: { select: { name: true } },
            },
        });
        res.status(201).json(formatCourseURLs(course, req));
    } catch (error) {
        handleError(error, res, 500, 'Failed to create course');
    }
};

/* =========================================================
   PERMISSION CHECK
========================================================= */
const canManageCourse = (
    role?: string,
    courseInstructorId?: string,
    userId?: string
) => {
    if (!role) return false;
    if (role === 'ADMIN') return true;
    if (role === 'INSTRUCTOR' && courseInstructorId && userId) {
        return courseInstructorId === userId;
    }
    return false;
};

/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */
const uploadToCloudinary = (
    buffer: Buffer,
    filename: string,
    mimetype: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const lowerFilename = filename.toLowerCase();

        // Default resource type is 'raw' for files like PDFs
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        let publicId = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;

        // Detect file type
        if (
            mimetype.startsWith('video/') ||
            lowerFilename.endsWith('.mp4') ||
            lowerFilename.endsWith('.mov') ||
            lowerFilename.endsWith('.avi') ||
            lowerFilename.endsWith('.mkv')
        ) {
            resourceType = 'video';
            publicId = `${Date.now()}-${filename.split('.')[0].replace(/\s+/g, '-')}`;
        } else if (mimetype.startsWith('image/')) {
            resourceType = 'image';
            publicId = `${Date.now()}-${filename.split('.')[0].replace(/\s+/g, '-')}`;
        } else if (lowerFilename.endsWith('.pdf')) {
            resourceType = 'raw'; // ensures PDF is uploaded correctly
            publicId = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'LearnIT_courses',
                resource_type: resourceType,
                public_id: publicId,
            },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary Upload Error]', error);
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error('No result from Cloudinary'));
                }

                // This URL will be correct for the file type
                resolve(result.secure_url);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};


/* =========================================================
   UPLOAD LESSON
========================================================= */
export const uploadLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, title, content, orderNumber, isFree } = req.body;
        const file = req.file;

        if (!courseId || !title) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let videoUrl = null;
        if (file) {
            videoUrl = file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
        }

        const lesson = await prisma.lesson.create({
            data: {
                courseId,
                title: title.trim(),
                content: content?.trim() || null,
                videoUrl,
                attachmentUrl,
                orderNumber: parseInt(orderNumber) || 1,
                isFree: isFree === 'true',
            },
        });

        res.status(201).json(formatCourseURLs({ lessons: [lesson] }, req).lessons[0]);
    } catch (error) {
        handleError(error, res, 500, 'Failed to upload lesson');
    }
};

/* =========================================================
   GET INSTRUCTOR COURSES
========================================================= */
export const getInstructorCourses = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { instructorId } = req.params;

        const courses = await prisma.course.findMany({
            where: { instructorId: String(instructorId) },
            include: { subject: true, lessons: true },
        });
        res.json(courses.map(c => formatCourseURLs(c, req)));
    } catch (error) {
        handleError(error, res, 500, 'Failed to fetch courses');
    }
};

/* =========================================================
   GET COURSE BY ID
========================================================= */
export const getCourseById = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                subject: true,
                lessons: {
                    orderBy: { orderNumber: 'asc' },
                },
                instructor: {
                    select: { name: true },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const isOwner = course.instructorId === userId;

        if (role === 'STUDENT' && !course.isPublished) {
            return res.status(403).json({
                error: 'This course is not approved for student access yet',
            });
        }

        if (role === 'INSTRUCTOR' && !course.isPublished && !isOwner) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!role && !course.isPublished) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(formatCourseURLs(course, req));
    } catch (error) {
        handleError(error, res, 500, 'Failed to fetch course details');
    }
};

/* =========================================================
   GET ALL COURSES
========================================================= */
export const getAllCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { status } = req.query;

        let whereClause: any = {};

        if (role === 'STUDENT' && userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { levelId: true },
            });

            if (user?.levelId) {
                whereClause.subject = {
                    levelId: user.levelId,
                };
            }

            whereClause.isPublished = true;
        }

        if (role === 'INSTRUCTOR' && userId) {
            whereClause.instructorId = userId;
        }

        if (status === 'pending') {
            whereClause.isPublished = false;
        }

        if (status === 'published') {
            whereClause.isPublished = true;
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                subject: true,
                instructor: { select: { name: true } },
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        videoUrl: true,
                        attachmentUrl: true,
                        orderNumber: true,
                    },
                    orderBy: { orderNumber: 'asc' },
                },
                _count: {
                    select: { lessons: true },
                },
            },
        });
        res.json(courses.map(c => formatCourseURLs(c, req)));
    } catch (error) {
        handleError(error, res, 500, 'Failed to fetch courses');
    }
};

export const publishCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.update({
            where: { id: String(id) },
            data: { isPublished: true },
            include: {
                subject: true,
                instructor: { select: { name: true } },
            },
        });
        res.json(formatCourseURLs(course, req));
    } catch (error) {
        handleError(error, res, 500, 'Failed to publish course');
    }
};

export const unpublishCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.update({
            where: { id: String(id) },
            data: { isPublished: false },
            include: {
                subject: true,
                instructor: { select: { name: true } },
            },
        });
        res.json(formatCourseURLs(course, req));
    } catch (error) {
        handleError(error, res, 500, 'Failed to unpublish course');
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, subjectId } = req.body;

        const data: any = {};
        if (title) data.title = title;
        if (description) data.description = description;
        if (subjectId) data.subjectId = subjectId;

        if (req.file) {
            data.thumbnailUrl = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
        }

        const course = await prisma.course.update({
            where: { id: String(id) },
            data,
            include: {
                subject: true,
                instructor: { select: { name: true } },
            },
        });
        res.json(formatCourseURLs(course, req));
    } catch (error) {
        handleError(error, res, 500, 'Failed to update course');
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({
            where: { id: String(id) },
        });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        handleError(error, res, 500, 'Failed to delete course');
    }
};

/* =========================================================
   SUBMIT COURSE UPDATES
========================================================= */
export const submitCourseUpdates = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { title, description } = req.body;

        const course = await prisma.course.findUnique({ where: { id } });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!canManageCourse(role, course.instructorId, userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!title?.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                isPublished: false,
            },
        });

        await prisma.supportMessage.create({
            data: {
                userId: String(userId),
                subject: `Course Update Review Request: ${updatedCourse.title}`,
                message: `Course ID: ${updatedCourse.id}\nInstructor ID: ${userId}\nRequest: Please review and approve the submitted course updates.`,
                status: 'OPEN',
            },
        });

        res.json({
            message: 'Updates submitted for admin review',
            course: updatedCourse,
        });
    } catch (error) {
        console.error('Failed to submit course updates:', error);
        res.status(500).json({ error: 'Failed to submit updates' });
    }
};

/* =========================================================
   REQUEST COURSE UNPUBLISH
========================================================= */
export const requestCourseUnpublish = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;
        const role = req.user?.role;
        const reason = String(req.body?.reason || '').trim();

        if (reason.length < 15) {
            return res.status(400).json({
                error:
                    'Please provide a valid unpublish reason (at least 15 characters)',
            });
        }

        const course = await prisma.course.findUnique({ where: { id } });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!canManageCourse(role, course.instructorId, userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.supportMessage.create({
            data: {
                userId: String(userId),
                subject: `Course Unpublish Request: ${course.title}`,
                message: `Course ID: ${course.id}\nInstructor ID: ${userId}\nReason: ${reason}`,
                status: 'OPEN',
            },
        });

        res.json({
            message: 'Unpublish request submitted to admin for review',
        });
    } catch (error) {
        console.error('Failed to request course unpublish:', error);
        res.status(500).json({
            error: 'Failed to submit unpublish request',
        });
    }
};
