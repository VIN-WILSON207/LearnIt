
console.log('Starting debug script...');
try {
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient imported.');
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaClient instantiated.');
    console.log('Client:', prisma);
} catch (e) {
    console.error('CRASHED:', e);
}
