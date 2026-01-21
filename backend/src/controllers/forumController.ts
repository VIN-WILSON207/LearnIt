import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, title, content } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const post = await prisma.forumPost.create({
            data: {
                userId,
                courseId,
                title,
                content,
            },
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
};

export const getPosts = async (req: Request, res: Response) => {
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
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const comment = await prisma.forumComment.create({
            data: {
                postId,
                userId,
                content,
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};