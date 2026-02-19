import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma';
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:3000';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

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
} else {
    transporter = null;
}

export const getRegistrationConfig = async (req: Request, res: Response) => {
    try {
        const levels = await prisma.level.findMany({
            include: {
                subjects: true,
            },
        });
        const allowedSubjectsByLevel: Record<string, string[]> = {
            'Ordinary Level': ['Computer Science'],
            'Advanced Level': ['Computer Science', 'ICT'],
        };

        const filteredLevels = levels.map((level) => {
            const allowedSubjects = allowedSubjectsByLevel[level.name] || [];
            const filtered = level.subjects.filter((subject) => allowedSubjects.includes(subject.name));
            const uniqueByName = new Map(filtered.map((subject) => [subject.name, subject]));
            return {
                ...level,
                subjects: Array.from(uniqueByName.values()),
            };
        });

        res.status(200).json(filteredLevels);
    } catch (error) {
        console.error('Failed to fetch registration config:', error);
        res.status(500).json({ error: 'Failed to fetch registration configuration' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, levelId, subjectId } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let resolvedLevelId: string | undefined;
        let resolvedSubjectId: string | undefined;

        if ((role || 'STUDENT') === 'STUDENT') {
            if (!levelId) {
                res.status(400).json({ error: 'Level is required for students' });
                return;
            }

            const level = await prisma.level.findUnique({
                where: { id: levelId },
                include: { subjects: true },
            });

            if (!level) {
                res.status(400).json({ error: 'Invalid level selected' });
                return;
            }

            const allowedSubjectsByLevel: Record<string, string[]> = {
                'Ordinary Level': ['Computer Science'],
                'Advanced Level': ['Computer Science', 'ICT'],
            };

            const allowedNames = allowedSubjectsByLevel[level.name] || [];
            const allowedSubjects = level.subjects.filter((subject) => allowedNames.includes(subject.name));

            if (allowedSubjects.length === 0) {
                res.status(400).json({ error: 'No valid subjects available for the selected level' });
                return;
            }

            if (level.name === 'Ordinary Level') {
                resolvedLevelId = level.id;
                resolvedSubjectId = allowedSubjects[0]?.id;
            } else {
                const requestedSubject = allowedSubjects.find((subject) => subject.id === subjectId)
                    || allowedSubjects.find((subject) => subject.name === 'Computer Science');
                if (!requestedSubject) {
                    res.status(400).json({ error: 'Invalid subject selected for the chosen level' });
                    return;
                }
                resolvedLevelId = level.id;
                resolvedSubjectId = requestedSubject.id;
            }
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                level: resolvedLevelId ? { connect: { id: resolvedLevelId } } : undefined,
                subject: resolvedSubjectId ? { connect: { id: resolvedSubjectId } } : undefined,
            },
            include: {
                level: true,
                subject: true,
                subscriptions: {
                    where: { isActive: true },
                    take: 1
                }
            }
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const subscription = user.subscriptions[0] || null;

        res.status(201).json({
            message: 'Successful registration',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                levelId: user.levelId,
                level: user.level,
                subjectId: user.subjectId,
                subject: user.subject,
                subscription,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                level: true,
                subscriptions: {
                    where: { isActive: true },
                    take: 1
                }
            }
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const subscription = user.subscriptions[0] || null;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                levelId: user.levelId,
                level: user.level,
                subscription,
            },
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(200).json({ message: 'If email exists, a reset link has been sent' });
        }

        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `${FRONTEND_BASE}/reset-password?token=${resetToken}`;

        if (transporter) {
            const fromAddress = SMTP_USER || 'no-reply@learnit.local';
            await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject: 'Reset your LearnIt password',
                html: `<p>You requested a password reset. Click the link below to reset your password (valid for 1 hour):</p>
                       <p><a href="${resetLink}">Reset Password</a></p>
                       <p>If you did not request this, please ignore this email.</p>`,
            });

            res.status(200).json({ message: 'Password reset email sent' });
        } else {
            console.log(`Reset token for ${email}: ${resetToken}`);
            res.status(200).json({
                message: 'Password reset token generated (development mode)',
                resetToken,
                resetLink,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process forgot password' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: 'Reset token and new password are required' });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET) as { userId: string; email: string };
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired reset token' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
