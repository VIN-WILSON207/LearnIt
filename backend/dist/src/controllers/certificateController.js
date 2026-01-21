"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificates = exports.generateCertificate = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        // Check progress
        const progress = await prisma_1.default.progress.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (!progress || progress.percent < 100) {
            return res.status(400).json({ error: 'Course not completed' });
        }
        // Check if already has certificate
        const existing = await prisma_1.default.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (existing)
            return res.json(existing);
        // Generate certificate 
        const fileUrl = `https://example.com/certificates/${studentId}-${courseId}.pdf`;
        const certificate = await prisma_1.default.certificate.create({
            data: {
                studentId,
                courseId,
                issueDate: new Date(),
                fileUrl,
            },
        });
        res.status(201).json(certificate);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
};
exports.generateCertificate = generateCertificate;
const getCertificates = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const certificates = await prisma_1.default.certificate.findMany({
            where: { studentId },
            include: { course: true },
        });
        res.json(certificates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};
exports.getCertificates = getCertificates;
