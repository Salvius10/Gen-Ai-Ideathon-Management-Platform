import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
const router = Router();

const SUPPORT_EMAIL = 'ganit_suppost@ganitinc.com';

async function isEventOpen(event: string): Promise<boolean> {
  const config = await prisma.eventConfig.findUnique({ where: { event } });
  return config?.isOpen ?? false;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

router.post('/', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, useCase1, useCase2, useCase3, description } = req.body;
  const userId = req.user!.userId;

  if (!await isEventOpen('TEAM_REGISTRATION')) {
    res.status(403).json({ message: 'Team registration is currently closed.' });
    return;
  }

  if (!name || !useCase1 || !useCase2 || !useCase3 || !description) {
    res.status(400).json({ message: 'Name, all three use cases, and description are required' });
    return;
  }

  const alreadyInTeam = await prisma.teamMember.findUnique({ where: { userId } });
  if (alreadyInTeam) {
    res.status(409).json({ message: 'You are already in a team' });
    return;
  }

  // Fuzzy name uniqueness: normalize by stripping non-alpha chars
  const normalizedNew = normalizeName(name);
  const existingTeams = await prisma.team.findMany({ select: { name: true } });
  const isDuplicate = existingTeams.some((t) => normalizeName(t.name) === normalizedNew);
  if (isDuplicate) {
    res.status(409).json({ message: 'A team with a similar name already exists. Please choose a different name.' });
    return;
  }

  const code = nanoid();
  const team = await prisma.team.create({
    data: {
      name,
      code,
      useCase1,
      useCase2,
      useCase3,
      description,
      useCase1Approved: false,
      useCase2Approved: false,
      useCase3Approved: false,
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
      title: 'New Team Created — Use Case Approval Needed',
      message: `Team "${team.name}" was created and requires use case approval.`,
    })),
  });

  res.status(201).json(team);
});

router.post('/join', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { code } = req.body;
  const userId = req.user!.userId;

  if (!await isEventOpen('TEAM_REGISTRATION')) {
    res.status(403).json({ message: 'Team registration is currently closed.' });
    return;
  }

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
      message: `A new member joined your team "${team.name}". Members: ${(updated?.members.length ?? 0)}/5.`,
    },
  });

  res.json({ ...updated, supportEmail: SUPPORT_EMAIL });
});

// Public leaderboard — all teams visible without auth
router.get('/leaderboard', async (_req, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      mentor: { select: { id: true, username: true, email: true } },
      owner: { select: { id: true, username: true, email: true } },
      evaluations: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const entries = teams.map((team) => {
    const evals = team.evaluations;
    let scores: { technicality: number; wowFactor: number; creativity: number; useCase: number; total: number } | null = null;

    if (evals.length > 0) {
      const avgTechnicality = Math.round(evals.reduce((s, e) => s + e.technicality, 0) / evals.length);
      const avgWowFactor = Math.round(evals.reduce((s, e) => s + e.wowFactor, 0) / evals.length);
      const avgCreativity = Math.round(evals.reduce((s, e) => s + e.creativity, 0) / evals.length);
      const avgUseCase = Math.round(evals.reduce((s, e) => s + e.useCase, 0) / evals.length);
      scores = {
        technicality: avgTechnicality,
        wowFactor: avgWowFactor,
        creativity: avgCreativity,
        useCase: avgUseCase,
        total: avgTechnicality + avgWowFactor + avgCreativity + avgUseCase,
      };
    }

    return {
      team: {
        id: team.id,
        name: team.name,
        useCase1: team.useCase1,
        useCase2: team.useCase2,
        useCase3: team.useCase3,
        useCase1Approved: team.useCase1Approved,
        useCase2Approved: team.useCase2Approved,
        useCase3Approved: team.useCase3Approved,
        members: team.members,
        owner: team.owner,
        mentor: team.mentor,
        memberCount: team.members.length,
        needsMoreMembers: team.members.length < 5,
        supportEmail: SUPPORT_EMAIL,
      },
      scores,
      judgeCount: evals.length,
    };
  });

  // Sort: evaluated teams by score DESC, then un-evaluated alphabetically
  entries.sort((a, b) => {
    if (a.scores && b.scores) return b.scores.total - a.scores.total;
    if (a.scores) return -1;
    if (b.scores) return 1;
    return a.team.name.localeCompare(b.team.name);
  });

  res.json(entries);
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
