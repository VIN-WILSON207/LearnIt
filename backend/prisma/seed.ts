
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
        create: { name: 'Ordinary Level', description: 'Grade 10-11' },
    });

    const al = await prisma.level.upsert({
        where: { name: 'Advanced Level' },
        update: {},
        create: { name: 'Advanced Level', description: 'Grade 12-13' },
    });

    console.log({ ol, al });

    // 3. Create Subjects
    const subjects = [
        { name: 'ICT', code: 'ICT-001', levelId: ol.id },
        { name: 'Mathematics', code: 'MAT-001', levelId: ol.id },
        { name: 'Science', code: 'SCI-001', levelId: ol.id },
        { name: 'ICT', code: 'ICT-002', levelId: al.id },
        { name: 'Computer Science', code: 'CS-001', levelId: al.id },
    ];

    for (const sub of subjects) {
        await prisma.subject.upsert({
            where: { code: sub.code },
            update: {},
            create: sub,
        });
    }
    // 4. Create Plans
    const freePlan = await prisma.plan.upsert({
        where: { name: 'Free' },
        update: {},
        create: { name: 'Free', price: 0, duration: 0 },
    });

    const basicPlan = await prisma.plan.upsert({
        where: { name: 'Basic' },
        update: {},
        create: { name: 'Basic', price: 10, duration: 1 },
    });

    const proPlan = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: { name: 'Pro', price: 20, duration: 1 },
    });

    console.log({ freePlan, basicPlan, proPlan });
    console.log('Seeding completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
