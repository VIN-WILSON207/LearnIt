import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const getPlans = async (req: Request, res: Response) => {
    try {
        const plans = await prisma.plan.findMany();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
    try {
        const { planId } = req.body;
        const studentId = req.user?.userId;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + plan.duration);

        const subscription = await prisma.subscription.create({
            data: {
                studentId,
                planId,
                startDate,
                endDate,
            },
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const subscriptions = await prisma.subscription.findMany({
            where: { studentId },
            include: { plan: true },
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};

export const checkAccess = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                studentId,
                isActive: true,
                endDate: { gte: new Date() },
            },
            include: { plan: true },
        });

        res.json({ hasAccess: !!activeSubscription, plan: activeSubscription?.plan });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check access' });
    }
};