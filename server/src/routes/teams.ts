import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
const router = Router();

router.post('/', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, problemStatement, description } = req.body;
  const userId = req.user!.userId;

  if (!name || !problemStatement || !description) {
    res.status(400).json({ message: 'Name, problem statement, and description are required' });
    return;
  }

  const alreadyInTeam = await prisma.teamMember.findUnique({ where: { userId } });
  if (alreadyInTeam) {
    res.status(409).json({ message: 'You are already in a team' });
    return;
  }

  const existingName = await prisma.team.findUnique({ where: { name } });
  if (existingName) {
    res.status(409).json({ message: 'Team name already taken' });
    return;
  }

  const code = nanoid();
  const team = await prisma.team.create({
    data: {
      name,
      code,
      problemStatement,
      description,
      ownerId: userId,
      members: { create: { userId } },
    },
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
    },
  });

  // Notify admin
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      title: 'New Team Created',
      message: `Team "${team.name}" was created and needs a mentor assignment.`,
    })),
  });

  res.status(201).json(team);
});

router.post('/join', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { code } = req.body;
  const userId = req.user!.userId;

  if (!code) {
    res.status(400).json({ message: 'Team code is required' });
    return;
  }

  const alreadyInTeam = await prisma.teamMember.findUnique({ where: { userId } });
  if (alreadyInTeam) {
    res.status(409).json({ message: 'You are already in a team' });
    return;
  }

  const team = await prisma.team.findUnique({
    where: { code: code.toUpperCase() },
    include: { members: true },
  });
  if (!team) {
    res.status(404).json({ message: 'Invalid team code' });
    return;
  }

  if (team.members.length >= 5) {
    res.status(409).json({ message: 'Team is full (max 5 members)' });
    return;
  }

  await prisma.teamMember.create({ data: { teamId: team.id, userId } });

  const updated = await prisma.team.findUnique({
    where: { id: team.id },
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
      owner: { select: { id: true, username: true, email: true } },
    },
  });

  // Notify team owner
  await prisma.notification.create({
    data: {
      userId: team.ownerId,
      title: 'New Member Joined',
      message: `A new member joined your team "${team.name}".`,
    },
  });

  res.json(updated);
});

router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
      owner: { select: { id: true, username: true, email: true } },
      checkIn1: true,
      checkIn2: true,
      submission: true,
      _count: { select: { evaluations: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(teams);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
      owner: { select: { id: true, username: true, email: true } },
      checkIn1: true,
      checkIn2: true,
      submission: true,
    },
  });

  if (!team) {
    res.status(404).json({ message: 'Team not found' });
    return;
  }

  res.json(team);
});

export default router;
