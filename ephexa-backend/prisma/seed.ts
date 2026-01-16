import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'alice@test.com' },
        update: {},
        create: {
            email: 'alice@test.com',
            passwordHash,
            dateOfBirth: new Date('1990-05-15'),
            isAdult: true,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'bob@test.com' },
        update: {},
        create: {
            email: 'bob@test.com',
            passwordHash,
            dateOfBirth: new Date('1988-08-22'),
            isAdult: true,
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'carol@test.com' },
        update: {},
        create: {
            email: 'carol@test.com',
            passwordHash,
            dateOfBirth: new Date('1995-12-01'),
            isAdult: true,
        },
    });

    console.log('✅ Created test users:', { user1: user1.email, user2: user2.email, user3: user3.email });

    // Create a test chat room
    const chatRoom = await prisma.chatRoom.create({
        data: {
            interest: 'Technology',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            users: {
                create: [
                    { userId: user1.id },
                    { userId: user2.id },
                ],
            },
        },
    });

    console.log('✅ Created test chat room:', chatRoom.id);

    // Add some test messages
    await prisma.message.createMany({
        data: [
            {
                content: 'Hey everyone! Excited to chat about tech.',
                senderId: user1.id,
                chatRoomId: chatRoom.id,
            },
            {
                content: 'Hi Alice! What topics are you interested in?',
                senderId: user2.id,
                chatRoomId: chatRoom.id,
            },
            {
                content: 'I love discussing AI and web development!',
                senderId: user1.id,
                chatRoomId: chatRoom.id,
            },
        ],
    });

    console.log('✅ Created test messages');

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌱 Database seeded successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test accounts created:
  📧 alice@test.com / password123
  📧 bob@test.com / password123
  📧 carol@test.com / password123

  `);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
