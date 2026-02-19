import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

const extractCourseId = (message: string) => {
    const match = message.match(/Course ID:\s*([a-zA-Z0-9-]+)/);
    return match?.[1] || null;
};

export const handleCourseAction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (action === 'approve') {
            await prisma.course.update({
                where: { id: String(id) },
                data: { isPublished: true }
            });
            return res.json({ message: 'Course approved' });
        }

        if (action === 'unpublish') {
            await prisma.course.update({
                where: { id: String(id) },
                data: { isPublished: false }
            });
            return res.json({ message: 'Course unpublished' });
        }

        if (action === 'delete') {
            await prisma.course.delete({
                where: { id: String(id) }
            });
            return res.json({ message: 'Course deleted' });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Admin course action failed:', error);
        res.status(500).json({ error: 'Failed to perform action' });
    }
};

export const getCourseReviewRequests = async (req: AuthRequest, res: Response) => {
    try {
        const requests = await prisma.supportMessage.findMany({
            where: {
                status: 'OPEN',
                OR: [
                    { subject: { startsWith: 'Course Unpublish Request:' } },
                    { subject: { startsWith: 'Course Update Review Request:' } },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const courseIds = Array.from(
            new Set(
                requests
                    .map((request) => extractCourseId(request.message))
                    .filter((id): id is string => Boolean(id))
            )
        );

        const courses = courseIds.length
            ? await prisma.course.findMany({
                where: { id: { in: courseIds } },
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            })
            : [];

        const courseById = new Map(courses.map((course) => [course.id, course]));

        const missingRequestIds: string[] = [];
        const normalized = requests.flatMap((request) => {
            const courseId = extractCourseId(request.message);
            const type = request.subject.startsWith('Course Unpublish Request:')
                ? 'UNPUBLISH'
                : 'UPDATE_REVIEW';
            const course = courseId ? (courseById.get(courseId) || null) : null;
            if (!course) {
                missingRequestIds.push(request.id);
                return [];
            }

            return [{
                id: request.id,
                type,
                subject: request.subject,
                message: request.message,
                status: request.status,
                createdAt: request.createdAt,
                requester: request.user,
                courseId,
                course,
            }];
        });

        if (missingRequestIds.length) {
            await prisma.supportMessage.updateMany({
                where: { id: { in: missingRequestIds } },
                data: { status: 'CLOSED' },
            });
        }

        res.status(200).json(normalized);
    } catch (error) {
        console.error('Failed to fetch course review requests:', error);
        res.status(500).json({ error: 'Failed to fetch course review requests' });
    }
};

export const handleCourseReviewRequestAction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;
        const adminId = req.user?.userId;

        if (!id) return res.status(400).json({ error: 'Request ID is required' });
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const request = await prisma.supportMessage.findUnique({
            where: { id: String(id) },
        });

        if (!request) return res.status(404).json({ error: 'Review request not found' });
        if (request.status !== 'OPEN') return res.status(400).json({ error: 'Review request is already closed' });

        const courseId = extractCourseId(request.message);
        if (!courseId) return res.status(400).json({ error: 'Course ID not found in review request' });

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const isUnpublishRequest = request.subject.startsWith('Course Unpublish Request:');

        if (action === 'approve') {
            if (isUnpublishRequest) {
                await prisma.course.update({
                    where: { id: course.id },
                    data: { isPublished: false },
                });
            } else {
                await prisma.course.update({
                    where: { id: course.id },
                    data: { isPublished: true },
                });
            }
        }

        await prisma.supportResponse.create({
            data: {
                messageId: request.id,
                adminId: String(adminId),
                response: String(note || (action === 'approve' ? 'Request approved by admin.' : 'Request rejected by admin.')),
            },
        });

        await prisma.supportMessage.update({
            where: { id: request.id },
            data: { status: 'CLOSED' },
        });

        res.status(200).json({
            message: action === 'approve' ? 'Review request approved' : 'Review request rejected',
        });
    } catch (error) {
        console.error('Failed to process course review request action:', error);
        res.status(500).json({ error: 'Failed to process review request action' });
    }
};

export const handleForumAction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (action === 'delete') {
            await prisma.forumPost.delete({
                where: { id: String(id) }
            });
            return res.json({ message: 'Post deleted' });
        }

        res.status(400).json({ error: 'Action not fully implemented or invalid' });
    } catch (error) {
        console.error('Admin forum action failed:', error);
        res.status(500).json({ error: 'Failed to perform action' });
    }
};
