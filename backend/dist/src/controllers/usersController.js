"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteUser = exports.restoreUser = exports.suspendUser = exports.changePassword = exports.getUsersByRole = exports.createUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Failed to fetch all users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
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
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                enrollments: true,
                certificates: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Failed to fetch user by ID:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
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
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(levelId && { levelId }),
            },
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, levelId, subjectId } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error('Failed to create user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }
        const users = await prisma_1.default.user.findMany({
            where: { role: role.toUpperCase() },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Failed to fetch users by role:', error);
        res.status(500).json({ error: 'Failed to fetch users by role' });
    }
};
exports.getUsersByRole = getUsersByRole;
const changePassword = async (req, res) => {
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
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Failed to change password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
// Admin endpoints
const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' },
        });
        res.status(200).json({ message: 'User suspended successfully', user });
    }
    catch (error) {
        console.error('Failed to suspend user:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
};
exports.suspendUser = suspendUser;
const restoreUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });
        res.status(200).json({ message: 'User restored successfully', user });
    }
    catch (error) {
        console.error('Failed to restore user:', error);
        res.status(500).json({ error: 'Failed to restore user' });
    }
};
exports.restoreUser = restoreUser;
const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { status: 'DELETED' },
        });
        res.status(200).json({ message: 'User deleted successfully', user });
    }
    catch (error) {
        console.error('Failed to delete user (admin):', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.adminDeleteUser = adminDeleteUser;
