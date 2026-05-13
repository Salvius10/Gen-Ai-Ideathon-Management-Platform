import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json(notifications);
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user!.userId) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }

  await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, read: false },
    data: { read: true },
  });
  res.json({ message: 'All marked as read' });
});

export default router;
