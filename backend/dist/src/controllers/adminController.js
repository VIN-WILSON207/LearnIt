"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleForumAction = exports.handleCourseReviewRequestAction = exports.getCourseReviewRequests = exports.handleCourseAction = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const extractCourseId = (message) => {
    const match = message.match(/Course ID:\s*([a-zA-Z0-9-]+)/);
    return match?.[1] || null;
};
const handleCourseAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (action === 'approve') {
            await prisma_1.default.course.update({
                where: { id: String(id) },
                data: { isPublished: true }
            });
            return res.json({ message: 'Course approved' });
        }
        if (action === 'unpublish') {
            await prisma_1.default.course.update({
                where: { id: String(id) },
                data: { isPublished: false }
            });
            return res.json({ message: 'Course unpublished' });
        }
        res.status(400).json({ error: 'Invalid action' });
    }
    catch (error) {
        console.error('Admin course action failed:', error);
        res.status(500).json({ error: 'Failed to perform action' });
    }
};
exports.handleCourseAction = handleCourseAction;
const getCourseReviewRequests = async (req, res) => {
    try {
        const requests = await prisma_1.default.supportMessage.findMany({
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
        const courseIds = Array.from(new Set(requests
            .map((request) => extractCourseId(request.message))
            .filter((id) => Boolean(id))));
        const courses = courseIds.length
            ? await prisma_1.default.course.findMany({
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
        const normalized = requests.map((request) => {
            const courseId = extractCourseId(request.message);
            const type = request.subject.startsWith('Course Unpublish Request:')
                ? 'UNPUBLISH'
                : 'UPDATE_REVIEW';
            return {
                id: request.id,
                type,
                subject: request.subject,
                message: request.message,
                status: request.status,
                createdAt: request.createdAt,
                requester: request.user,
                courseId,
                course: courseId ? (courseById.get(courseId) || null) : null,
            };
        });
        res.status(200).json(normalized);
    }
    catch (error) {
        console.error('Failed to fetch course review requests:', error);
        res.status(500).json({ error: 'Failed to fetch course review requests' });
    }
};
exports.getCourseReviewRequests = getCourseReviewRequests;
const handleCourseReviewRequestAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;
        const adminId = req.user?.userId;
        if (!id)
            return res.status(400).json({ error: 'Request ID is required' });
        if (!adminId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        const request = await prisma_1.default.supportMessage.findUnique({
            where: { id: String(id) },
        });
        if (!request)
            return res.status(404).json({ error: 'Review request not found' });
        if (request.status !== 'OPEN')
            return res.status(400).json({ error: 'Review request is already closed' });
        const courseId = extractCourseId(request.message);
        if (!courseId)
            return res.status(400).json({ error: 'Course ID not found in review request' });
        const course = await prisma_1.default.course.findUnique({ where: { id: courseId } });
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        const isUnpublishRequest = request.subject.startsWith('Course Unpublish Request:');
        if (action === 'approve') {
            if (isUnpublishRequest) {
                await prisma_1.default.course.update({
                    where: { id: course.id },
                    data: { isPublished: false },
                });
            }
            else {
                await prisma_1.default.course.update({
                    where: { id: course.id },
                    data: { isPublished: true },
                });
            }
        }
        await prisma_1.default.supportResponse.create({
            data: {
                messageId: request.id,
                adminId: String(adminId),
                response: String(note || (action === 'approve' ? 'Request approved by admin.' : 'Request rejected by admin.')),
            },
        });
        await prisma_1.default.supportMessage.update({
            where: { id: request.id },
            data: { status: 'CLOSED' },
        });
        res.status(200).json({
            message: action === 'approve' ? 'Review request approved' : 'Review request rejected',
        });
    }
    catch (error) {
        console.error('Failed to process course review request action:', error);
        res.status(500).json({ error: 'Failed to process review request action' });
    }
};
exports.handleCourseReviewRequestAction = handleCourseReviewRequestAction;
const handleForumAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (action === 'delete') {
            await prisma_1.default.forumPost.delete({
                where: { id: String(id) }
            });
            return res.json({ message: 'Post deleted' });
        }
        res.status(400).json({ error: 'Action not fully implemented or invalid' });
    }
    catch (error) {
        console.error('Admin forum action failed:', error);
        res.status(500).json({ error: 'Failed to perform action' });
    }
};
exports.handleForumAction = handleForumAction;
