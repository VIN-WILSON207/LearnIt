import { Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types/express';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                levelId: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const authId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'ADMIN' && userId !== authId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId as string },
            include: {
                enrollments: true,
                certificates: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Failed to fetch user by ID:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { name, email, levelId } = req.body;
        const authId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'ADMIN' && userId !== authId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.update({
            where: { id: userId as string },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(levelId && { levelId }),
            },
        });

        res.status(200).json(user);
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        await prisma.user.delete({
            where: { id: userId as string },
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};



export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role, levelId, subjectId } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
                level: (role === 'STUDENT' && levelId)
                    ? { connect: { id: levelId } }
                    : undefined,
                // @ts-ignore
                subjectId: (role === 'STUDENT' && subjectId) ? subjectId : null,
                status: 'ACTIVE',
            },
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Failed to create user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const getUsersByRole = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.params;

        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        const users = await prisma.user.findMany({
            where: { role: (role as string).toUpperCase() as any },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Failed to fetch users by role:', error);
        res.status(500).json({ error: 'Failed to fetch users by role' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;
        const authId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'ADMIN' && userId !== authId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId as string },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId as string },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Failed to change password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// Admin endpoints
export const suspendUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.update({
            where: { id: userId as string },
            data: { status: 'SUSPENDED' },
        });

        res.status(200).json({ message: 'User suspended successfully', user });
    } catch (error) {
        console.error('Failed to suspend user:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
};

export const restoreUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.update({
            where: { id: userId as string },
            data: { status: 'ACTIVE' },
        });

        res.status(200).json({ message: 'User restored successfully', user });
    } catch (error) {
        console.error('Failed to restore user:', error);
        res.status(500).json({ error: 'Failed to restore user' });
    }
};

export const adminDeleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.update({
            where: { id: userId as string },
            data: { status: 'DELETED' },
        });

        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        console.error('Failed to delete user (admin):', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
