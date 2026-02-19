import { Response, Request } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types/express';

export const getAllPlans = async (req: AuthRequest, res: Response) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { price: 'asc' },
        });

        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscription plans' });
    }
};

export const createPlan = async (req: Request, res: Response) => {
    try {
        const { name, price, duration, description, features } = req.body;

        if (!name || price === undefined || duration === undefined) {
            return res.status(400).json({ success: false, error: 'Plan name, price, and duration are required' });
        }

        if (price <= 0 || duration <= 0) {
            return res.status(400).json({ success: false, error: 'Price and duration must be greater than 0' });
        }

        const existingPlan = await prisma.plan.findUnique({ where: { name } });
        if (existingPlan) return res.status(400).json({ success: false, error: 'Plan with this name already exists' });

        const newPlan = await prisma.plan.create({
            data: {
                name: name.trim(),
                price: parseFloat(price),
                duration: parseInt(duration),
                description: description || null,
                features: features || [],
            } as any,
        });

        res.status(201).json({ success: true, data: newPlan, message: 'Subscription plan created successfully' });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ success: false, error: 'Failed to create subscription plan' });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) id = id[0];

        const { name, price, duration, description, features } = req.body;

        if (!name || price === undefined || duration === undefined) {
            return res.status(400).json({ success: false, error: 'Plan name, price, and duration are required' });
        }

        if (price <= 0 || duration <= 0) {
            return res.status(400).json({ success: false, error: 'Price and duration must be greater than 0' });
        }

        const existingPlan = await prisma.plan.findUnique({ where: { id } });
        if (!existingPlan) return res.status(404).json({ success: false, error: 'Subscription plan not found' });

        if (name !== existingPlan.name) {
            const duplicatePlan = await prisma.plan.findUnique({ where: { name } });
            if (duplicatePlan) return res.status(400).json({ success: false, error: 'Plan with this name already exists' });
        }

        const updatedPlan = await prisma.plan.update({
            where: { id },
            data: {
                name: name.trim(),
                price: parseFloat(price),
                duration: parseInt(duration),
                description: description || null,
                features: features || [],
            } as any,
        });

        res.status(200).json({ success: true, data: updatedPlan, message: 'Subscription plan updated successfully' });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ success: false, error: 'Failed to update subscription plan' });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) id = id[0];

        const existingPlan = await prisma.plan.findUnique({ where: { id } });
        if (!existingPlan) return res.status(404).json({ success: false, error: 'Subscription plan not found' });

        const activeSubscriptions = await prisma.subscription.findMany({
            where: { planId: id, isActive: true },
        });

        if (activeSubscriptions.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete plan with ${activeSubscriptions.length} active subscription(s)`,
            });
        }

        await prisma.plan.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Subscription plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ success: false, error: 'Failed to delete subscription plan' });
    }
};

export const getPlans = async (req: AuthRequest, res: Response) => {
    try {
        const plans = await prisma.plan.findMany();
        res.json(plans);
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
    try {
        let planId = req.body.planId;
        if (Array.isArray(planId)) planId = planId[0];

        const studentId = req.user?.userId;
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + plan.duration);

        const subscription = await prisma.subscription.create({
            data: { studentId, planId, startDate, endDate },
        });

        res.status(201).json(subscription);
    } catch (error) {
        console.error('Failed to subscribe:', error);
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
        console.error('Failed to fetch user subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};

export const checkAccess = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const activeSubscription = await prisma.subscription.findFirst({
            where: { studentId, isActive: true, endDate: { gte: new Date() } },
            include: { plan: true },
        });

        res.json({ hasAccess: !!activeSubscription, plan: activeSubscription?.plan });
    } catch (error) {
        console.error('Failed to check access:', error);
        res.status(500).json({ error: 'Failed to check access' });
    }
};

export const getAllSubscriptions = async (req: AuthRequest, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            include: {
                student: {
                    select: { name: true, email: true }
                },
                plan: true
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(subscriptions);
    } catch (error) {
        console.error('Failed to fetch all subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch all subscriptions' });
    }
};
