import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { name, email, password, role, levelId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: (role || 'STUDENT') as Role,
                levelId: levelId || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const role = req.query.role as string | undefined;

        const whereClause: { role?: Role } = role ? { role: role.toUpperCase() as Role } : {};

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;

        // Users can view their own profile, admins can view any
        if (userId !== id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.userId;

        // Only admins can update other users
        if (userId !== id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { name, email, role, levelId } = req.body;

        // Only admins can change roles
        if (role && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can change user roles' });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role && req.user?.role === 'ADMIN') updateData.role = role as Role;
        if (levelId !== undefined) {
            if (levelId === null) {
                updateData.level = { disconnect: true };
            } else {
                updateData.level = { connect: { id: levelId } };
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                level: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const id = String(req.params.id);

        // Prevent self-deletion
        if (req.user?.userId === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.user.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
