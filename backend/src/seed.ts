import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.pick.deleteMany();
  await prisma.card.deleteMany();
  await prisma.player.deleteMany();
  await prisma.game.deleteMany();

  // Generate prize positions
  const totalCards = 50;
  const prizeCount = 1;
  const prizePositions = Array.from({ length: totalCards }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, prizeCount);

  // Create demo game
  const game = await prisma.game.create({
    data: {
      name: 'Demo Game',
      totalCards,
      prizeCount,
      playerSlots: 6,
      status: 'DRAFT',
      prizePositions: Buffer.from(JSON.stringify(prizePositions)).toString('base64'),
    },
  });

  console.log(`✅ Created game: ${game.name} (${game.id})`);

  // Create players
  const playerNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank'];
  const players = [];

  for (let i = 0; i < playerNames.length; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const hashedCode = await bcrypt.hash(code, 10);

    const player = await prisma.player.create({
      data: {
        gameId: game.id,
        username: playerNames[i],
        code: hashedCode,
        playerIndex: i,
      },
    });

    players.push({ ...player, plainCode: code });
  }

  console.log('✅ Created players:');
  players.forEach((player, index) => {
    console.log(`   ${index + 1}. ${player.username}: ${player.plainCode}`);
  });

  // Create cards
  const cards = await Promise.all(
    Array.from({ length: totalCards }, (_, index) =>
      prisma.card.create({
        data: {
          gameId: game.id,
          positionIndex: index,
          isPrize: prizePositions.includes(index),
        },
      })
    )
  );

  console.log(`✅ Created ${cards.length} cards`);
  console.log(`🎯 Prize position: ${prizePositions[0]}`);

  console.log('\n🎮 Demo game ready!');
  console.log('📋 Player codes:');
  players.forEach((player, index) => {
    console.log(`   ${player.username}: ${player.plainCode}`);
  });
  console.log('\n💡 Use these codes to test player login');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });











