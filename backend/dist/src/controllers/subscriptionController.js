"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccess = exports.getUserSubscriptions = exports.subscribe = exports.getPlans = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getPlans = async (req, res) => {
    try {
        const plans = await prisma_1.default.plan.findMany();
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};
exports.getPlans = getPlans;
const subscribe = async (req, res) => {
    try {
        const { planId } = req.body;
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
            data: {
                studentId,
                planId,
                startDate,
                endDate,
            },
        });
        res.status(201).json(subscription);
    }
    catch (error) {
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
            where: {
                studentId,
                isActive: true,
                endDate: { gte: new Date() },
            },
            include: { plan: true },
        });
        res.json({ hasAccess: !!activeSubscription, plan: activeSubscription?.plan });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check access' });
    }
};
exports.checkAccess = checkAccess;
