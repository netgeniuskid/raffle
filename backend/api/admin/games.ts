import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const games = await prisma.game.findMany({
        include: {
          players: true,
          cards: true,
          picks: true
        }
      });
      res.status(200).json(games);
    } else if (req.method === 'POST') {
      const { name, totalCards, prizeCount, prizeNames, playerSlots } = req.body;
      
      const game = await prisma.game.create({
        data: {
          name,
          totalCards,
          prizeCount,
          prizeNames: JSON.stringify(prizeNames),
          playerSlots
        }
      });
      
      res.status(201).json(game);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
