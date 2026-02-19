"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = exports.getSubjectsByLevel = exports.getSubjects = exports.getLevels = exports.updateSettings = exports.getAppConfig = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const seedDefaults = async () => {
    const defaults = [
        { key: 'appName', value: 'LearnIt', type: 'string' },
        { key: 'maintenanceMode', value: 'false', type: 'boolean' },
        { key: 'contactEmail', value: 'support@learnit.com', type: 'string' },
        { key: 'globalQuizPassMark', value: '50', type: 'number' },
        { key: 'maxQuizAttempts', value: '3', type: 'number' },
        { key: 'allowInstructorRegistration', value: 'true', type: 'boolean' },
    ];
    for (const d of defaults) {
        await prisma_1.default.setting.upsert({
            where: { key: d.key },
            update: {},
            create: d,
        });
    }
};
const getAppConfig = async (req, res) => {
    try {
        await seedDefaults();
        const levels = await prisma_1.default.level.findMany({
            include: { subjects: true },
        });
        const settings = await prisma_1.default.setting.findMany();
        const settingsMap = {};
        settings.forEach(s => {
            let val = s.value;
            if (s.type === 'boolean')
                val = s.value === 'true';
            if (s.type === 'number')
                val = Number(s.value);
            if (s.type === 'json')
                val = JSON.parse(s.value);
            settingsMap[s.key] = val;
        });
        const config = {
            levels,
            settings: settingsMap,
            rawSettings: settings,
            version: process.env.APP_VERSION || '1.0.0',
        };
        res.status(200).json(config);
    }
    catch (error) {
        console.error('Failed to fetch app config:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
};
exports.getAppConfig = getAppConfig;
const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        if (!Array.isArray(settings)) {
            return res.status(400).json({ error: 'Settings must be an array' });
        }
        const updates = settings.map(s => {
            const value = typeof s.value === 'string' ? s.value : String(s.value);
            return prisma_1.default.setting.update({
                where: { key: s.key },
                data: { value }
            });
        });
        await Promise.all(updates);
        res.json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Failed to update settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
const getLevels = async (req, res) => {
    try {
        const levels = await prisma_1.default.level.findMany({
            include: { subjects: true },
        });
        res.status(200).json(levels);
    }
    catch (error) {
        console.error('Failed to fetch levels:', error);
        res.status(500).json({ error: 'Failed to fetch levels' });
    }
};
exports.getLevels = getLevels;
const getSubjects = async (req, res) => {
    try {
        const subjects = await prisma_1.default.subject.findMany({
            include: { level: true },
        });
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Failed to fetch subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};
exports.getSubjects = getSubjects;
const getSubjectsByLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        if (!levelId) {
            return res.status(400).json({ error: 'Level ID is required' });
        }
        const subjects = await prisma_1.default.subject.findMany({
            where: { levelId: levelId },
        });
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Failed to fetch subjects by level:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};
exports.getSubjectsByLevel = getSubjectsByLevel;
const getHealthStatus = async (req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getHealthStatus = getHealthStatus;
