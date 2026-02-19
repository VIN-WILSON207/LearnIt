import { Response, Request } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@learnit.com';
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:3000';

let transporter: any = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

const sendEmail = async (to: string, subject: string, html: string) => {
    if (!transporter) {
        console.log('Email transporter not configured, skipping email:', { to, subject });
        return;
    }

    try {
        await transporter.sendMail({
            from: SUPPORT_EMAIL,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Failed to send email:', error);
    }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const supportMessage = await prisma.supportMessage.create({
            data: {
                userId,
                subject,
                message,
                status: 'OPEN',
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                responses: true,
            },
        });

        const userEmailHtml = `
            <h2>Support Request Received</h2>
            <p>Hi ${supportMessage.user?.name},</p>
            <p>Thank you for contacting our support team. We have received your message:</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p>Our support team will review your message and respond as soon as possible. You can check the status of your request in your support dashboard.</p>
            <p>Best regards,<br>LearnIt Support Team</p>
        `;

        if (supportMessage.user?.email) {
            await sendEmail(
                supportMessage.user.email,
                `Support Request Received: ${subject}`,
                userEmailHtml
            );
        }

        const adminEmailHtml = `
            <h2>New Support Request</h2>
            <p><strong>From:</strong> ${supportMessage.user?.name} (${supportMessage.user?.email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <p><a href="${FRONTEND_BASE}/admin">View in Admin Dashboard</a></p>
        `;

        await sendEmail(
            SUPPORT_EMAIL,
            `New Support Request: ${subject}`,
            adminEmailHtml
        );

        res.status(201).json(supportMessage);
    } catch (error) {
        console.error('Failed to create support message:', error);
        res.status(500).json({ error: 'Failed to create support message' });
    }
};

export const getUserMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const messages = await prisma.supportMessage.findMany({
            where: { userId },
            include: {
                user: { select: { name: true, email: true } },
                responses: {
                    include: {
                        admin: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch support messages' });
    }
};

export const getMessage = async (req: AuthRequest, res: Response) => {
    try {
        const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])[0];
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const message = await prisma.supportMessage.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                responses: {
                    include: {
                        admin: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!message) return res.status(404).json({ error: 'Message not found' });

        if (req.user?.role !== 'ADMIN' && message.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(message);
    } catch (error) {
        console.error('Failed to fetch support message details:', error);
        res.status(500).json({ error: 'Failed to fetch support message' });
    }
};

export const getAllMessages = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const messages = await prisma.supportMessage.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                responses: {
                    include: {
                        admin: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch support messages' });
    }
};

export const addResponse = async (req: AuthRequest, res: Response) => {
    try {
        const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id as string[])[0];
        const { response } = req.body;
        const adminId = req.user?.userId;

        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const message = await prisma.supportMessage.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, email: true } } },
        });

        if (!message) return res.status(404).json({ error: 'Message not found' });

        const admin = await prisma.user.findUnique({
            where: { id: adminId },
            select: { id: true, name: true, email: true },
        });

        const supportResponse = await prisma.supportResponse.create({
            data: {
                messageId: id,
                adminId,
                response,
            },
            include: {
                admin: { select: { id: true, name: true, email: true } },
            },
        });

        const userEmailHtml = `
            <h2>New Response to Your Support Request</h2>
            <p>Hi ${message.user?.name},</p>
            <p>Our support team has responded to your request: <strong>"${message.subject}"</strong></p>
            <p><strong>Response:</strong></p>
            <p>${response}</p>
            <p>You can view your full conversation in your support dashboard.</p>
            <p>Best regards,<br>LearnIt Support Team</p>
        `;

        if (message.user?.email) {
            await sendEmail(
                message.user.email,
                `Response to Your Support Request: ${message.subject}`,
                userEmailHtml
            );
        }

        res.status(201).json(supportResponse);
    } catch (error) {
        console.error('Failed to add support response:', error);
        res.status(500).json({ error: 'Failed to add response' });
    }
};

export const updateMessageStatus = async (req: AuthRequest, res: Response) => {
    try {
        let id = req.body.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const { status } = req.body;

        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const message = await prisma.supportMessage.update({
            where: { id },
            data: { status },
            include: {
                user: { select: { name: true, email: true } },
                responses: {
                    include: {
                        admin: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        res.json(message);
    } catch (error) {
        console.error('Failed to update support status:', error);
        res.status(500).json({ error: 'Failed to update message status' });
    }
};