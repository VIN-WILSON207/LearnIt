"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.getAllTickets = exports.getUserTickets = exports.createTicket = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const ticket = await prisma_1.default.supportTicket.create({
            data: {
                userId,
                subject,
                message,
            },
        });
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};
exports.createTicket = createTicket;
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const tickets = await prisma_1.default.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
exports.getUserTickets = getUserTickets;
const getAllTickets = async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN')
            return res.status(403).json({ error: 'Forbidden' });
        const tickets = await prisma_1.default.supportTicket.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
exports.getAllTickets = getAllTickets;
const updateTicketStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (req.user?.role !== 'ADMIN')
            return res.status(403).json({ error: 'Forbidden' });
        const ticket = await prisma_1.default.supportTicket.update({
            where: { id },
            data: { status },
        });
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};
exports.updateTicketStatus = updateTicketStatus;
