import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const events = await prisma.eventConfig.findMany({
    select: { event: true, label: true, isOpen: true },
  });
  res.json(events);
});

export default router;
