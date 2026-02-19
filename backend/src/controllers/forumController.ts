import { Response, Request } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, title, content } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const post = await prisma.forumPost.create({
            data: { userId, courseId, title, content },
        });

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const posts = await prisma.forumPost.findMany({
            where: { courseId: String(courseId) },
            include: {
                user: { select: { name: true } },
                comments: {
                    include: { user: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

const mapPost = (post: any) => {
    const replies = (post.comments || []).map((c: any) => ({
        id: c.id,
        author: c.user?.name || 'Unknown',
        authorRole: (c.user?.role || 'student').toLowerCase(),
        content: c.content,
        createdDate: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
        isApproved: true,
    }));

    const lastActivityDate = replies.length
        ? replies[0].createdDate
        : (post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt);

    return {
        id: post.id,
        courseId: post.courseId,
        courseName: post.course?.title || 'Unknown Course',
        title: post.title,
        author: post.user?.name || 'Unknown',
        authorRole: (post.user?.role || 'student').toLowerCase(),
        content: post.content,
        createdDate: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
        replies,
        lastActivity: lastActivityDate,
        repliesCount: replies.length,
    };
};

export const getPostsQuery = async (req: Request, res: Response) => {
    try {
        const { courseId, id } = req.query;

        if (id) {
            const post = await prisma.forumPost.findUnique({
                where: { id: String(id) },
                include: {
                    user: { select: { name: true, role: true } },
                    course: { select: { title: true } },
                    comments: {
                        include: { user: { select: { name: true, role: true } } },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });

            if (!post) return res.status(404).json({ error: 'Post not found' });
            return res.json(mapPost(post));
        }

        const posts = await prisma.forumPost.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                user: { select: { name: true, role: true } },
                course: { select: { title: true } },
                comments: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: courseId ? undefined : 50,
        });

        res.json(posts.map(mapPost));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

export const getForumReports = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await prisma.forumPost.findMany({
            include: {
                user: { select: { name: true, role: true } },
                course: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const reports = posts.map((post) => ({
            id: post.id,
            title: post.title,
            author: post.user?.name || 'Unknown',
            createdDate: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
            course: post.course?.title || 'Unknown Course',
            content: post.content,
            status: 'pending',
            reportedBy: null,
        }));

        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch forum reports' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const comment = await prisma.forumComment.create({
            data: { postId, userId, content },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
