import { PrismaClient } from '@prisma/client';

console.log('Starting debug script...');
try {
    console.log('PrismaClient imported.');
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaClient instantiated.');
    console.log('Client:', prisma);
} catch (e) {
    console.error('CRASHED:', e);
}
