"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.getPosts = exports.createPost = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createPost = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const post = await prisma_1.default.forumPost.create({
            data: {
                userId,
                courseId,
                title,
                content,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const { courseId } = req.params;
        const posts = await prisma_1.default.forumPost.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};
exports.getPosts = getPosts;
const addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const comment = await prisma_1.default.forumComment.create({
            data: {
                postId,
                userId,
                content,
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
exports.addComment = addComment;
