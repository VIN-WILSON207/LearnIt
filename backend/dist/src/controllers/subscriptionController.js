"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscriptions = exports.checkAccess = exports.getUserSubscriptions = exports.subscribe = exports.getPlans = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getAllPlans = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAllPlans = async (req, res) => {
    try {
        const plans = await prisma_1.default.plan.findMany({
            orderBy: { price: 'asc' },
        });
        res.status(200).json({ success: true, data: plans });
    }
    catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscription plans' });
    }
};
exports.getAllPlans = getAllPlans;
const createPlan = async (req, res) => {
    try {
        const { name, price, duration, description, features } = req.body;
        if (!name || price === undefined || duration === undefined) {
            return res.status(400).json({ success: false, error: 'Plan name, price, and duration are required' });
        }
        if (price <= 0 || duration <= 0) {
            return res.status(400).json({ success: false, error: 'Price and duration must be greater than 0' });
        }
        const existingPlan = await prisma_1.default.plan.findUnique({ where: { name } });
        if (existingPlan)
            return res.status(400).json({ success: false, error: 'Plan with this name already exists' });
        const newPlan = await prisma_1.default.plan.create({
            data: {
                name: name.trim(),
                price: parseFloat(price),
                duration: parseInt(duration),
                description: description || null,
                features: features || [],
            },
        });
        res.status(201).json({ success: true, data: newPlan, message: 'Subscription plan created successfully' });
    }
    catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ success: false, error: 'Failed to create subscription plan' });
    }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id))
            id = id[0];
        const { name, price, duration, description, features } = req.body;
        if (!name || price === undefined || duration === undefined) {
            return res.status(400).json({ success: false, error: 'Plan name, price, and duration are required' });
        }
        if (price <= 0 || duration <= 0) {
            return res.status(400).json({ success: false, error: 'Price and duration must be greater than 0' });
        }
        const existingPlan = await prisma_1.default.plan.findUnique({ where: { id } });
        if (!existingPlan)
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        if (name !== existingPlan.name) {
            const duplicatePlan = await prisma_1.default.plan.findUnique({ where: { name } });
            if (duplicatePlan)
                return res.status(400).json({ success: false, error: 'Plan with this name already exists' });
        }
        const updatedPlan = await prisma_1.default.plan.update({
            where: { id },
            data: {
                name: name.trim(),
                price: parseFloat(price),
                duration: parseInt(duration),
                description: description || null,
                features: features || [],
            },
        });
        res.status(200).json({ success: true, data: updatedPlan, message: 'Subscription plan updated successfully' });
    }
    catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ success: false, error: 'Failed to update subscription plan' });
    }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id))
            id = id[0];
        const existingPlan = await prisma_1.default.plan.findUnique({ where: { id } });
        if (!existingPlan)
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        const activeSubscriptions = await prisma_1.default.subscription.findMany({
            where: { planId: id, isActive: true },
        });
        if (activeSubscriptions.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete plan with ${activeSubscriptions.length} active subscription(s)`,
            });
        }
        await prisma_1.default.plan.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Subscription plan deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ success: false, error: 'Failed to delete subscription plan' });
    }
};
exports.deletePlan = deletePlan;
const getPlans = async (req, res) => {
    try {
        const plans = await prisma_1.default.plan.findMany();
        res.json(plans);
    }
    catch (error) {
        console.error('Failed to fetch plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};
exports.getPlans = getPlans;
const subscribe = async (req, res) => {
    try {
        let planId = req.body.planId;
        if (Array.isArray(planId))
            planId = planId[0];
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const plan = await prisma_1.default.plan.findUnique({ where: { id: planId } });
        if (!plan)
            return res.status(404).json({ error: 'Plan not found' });
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + plan.duration);
        const subscription = await prisma_1.default.subscription.create({
            data: { studentId, planId, startDate, endDate },
        });
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error('Failed to subscribe:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};
exports.subscribe = subscribe;
const getUserSubscriptions = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const subscriptions = await prisma_1.default.subscription.findMany({
            where: { studentId },
            include: { plan: true },
        });
        res.json(subscriptions);
    }
    catch (error) {
        console.error('Failed to fetch user subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};
exports.getUserSubscriptions = getUserSubscriptions;
const checkAccess = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const activeSubscription = await prisma_1.default.subscription.findFirst({
            where: { studentId, isActive: true, endDate: { gte: new Date() } },
            include: { plan: true },
        });
        res.json({ hasAccess: !!activeSubscription, plan: activeSubscription?.plan });
    }
    catch (error) {
        console.error('Failed to check access:', error);
        res.status(500).json({ error: 'Failed to check access' });
    }
};
exports.checkAccess = checkAccess;
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await prisma_1.default.subscription.findMany({
            include: {
                student: {
                    select: { name: true, email: true }
                },
                plan: true
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(subscriptions);
    }
    catch (error) {
        console.error('Failed to fetch all subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch all subscriptions' });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
