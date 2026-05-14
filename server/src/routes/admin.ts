import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalUsers, totalTeams, totalSubmissions, totalEvaluations] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.submission.count(),
    prisma.evaluation.count(),
  ]);

  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });

  res.json({
    totalUsers,
    totalTeams,
    totalSubmissions,
    totalEvaluations,
    byRole: byRole.reduce((acc, r) => ({ ...acc, [r.role]: r._count.role }), {} as Record<string, number>),
  });
});

router.get('/users', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      teamMembership: { select: { team: { select: { id: true, name: true } } } },
      ownedTeam: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.patch('/users/:id/role', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.body;
  const validRoles = ['PARTICIPANT', 'MENTOR', 'JUDGE', 'ADMIN'];

  if (!validRoles.includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, username: true, email: true, role: true },
  });

  res.json(user);
});

router.delete('/users/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.params.id === req.user!.userId) {
    res.status(400).json({ message: 'Cannot delete your own account' });
    return;
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

router.get('/teams', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
      owner: { select: { id: true, username: true, email: true } },
      checkIn1: true,
      checkIn2: true,
      submission: true,
      evaluations: { include: { judge: { select: { id: true, username: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(teams);
});

router.delete('/teams/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.team.delete({ where: { id: req.params.id } });
  res.json({ message: 'Team deleted' });
});

// ─── Event Control ────────────────────────────────────────────────────────────

router.get('/events', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const events = await prisma.eventConfig.findMany({ orderBy: { event: 'asc' } });
  res.json(events);
});

router.patch('/events/:event', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { isOpen } = req.body;
  if (typeof isOpen !== 'boolean') {
    res.status(400).json({ message: 'isOpen must be a boolean' });
    return;
  }

  const config = await prisma.eventConfig.update({
    where: { event: req.params.event },
    data: { isOpen },
  });
  res.json(config);
});

export default router;
