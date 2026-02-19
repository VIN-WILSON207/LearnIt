import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin
    const password = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@learnit.com' },
        update: {},
        create: {
            email: 'admin@learnit.com',
            password,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    console.log({ admin });

    // 2. Create Levels
    const ol = await prisma.level.upsert({
        where: { name: 'Ordinary Level' },
        update: {},
        create: { name: 'Ordinary Level', description: 'O-Level' },
    });

    const al = await prisma.level.upsert({
        where: { name: 'Advanced Level' },
        update: {},
        create: { name: 'Advanced Level', description: 'A-Level' },
    });

    console.log({ ol, al });

    // 3. Create Subjects
    const subjects = [
        { name: 'Computer Science', code: 'CS-OL', levelId: ol.id },
        { name: 'Computer Science', code: 'CS-AL', levelId: al.id },
        { name: 'ICT', code: 'ICT-AL', levelId: al.id },
    ];

    for (const sub of subjects) {
        await prisma.subject.upsert({
            where: { code: sub.code },
            update: {},
            create: sub,
        });
    }

    // 4. Create Plans
    const basicPlan = await prisma.plan.upsert({
        where: { name: 'Basic' },
        update: {},
        create: { name: 'Basic', price: 500, duration: 1 },
    });

    const proPlan = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: { name: 'Pro', price: 1000, duration: 1 },
    });

    console.log({ basicPlan, proPlan });
    console.log('Seeding completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        // @ts-ignore 
        process.exit(1);
    });
