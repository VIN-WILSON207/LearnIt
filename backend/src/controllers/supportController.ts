import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const createTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject,
                message,
            },
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

export const getUserTickets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

export const getAllTickets = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const tickets = await prisma.supportTicket.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id, status } = req.body;

        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: { status },
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};