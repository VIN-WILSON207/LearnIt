"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
console.log('Starting debug script...');
try {
    console.log('PrismaClient imported.');
    const prisma = new client_1.PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaClient instantiated.');
    console.log('Client:', prisma);
}
catch (e) {
    console.error('CRASHED:', e);
}
