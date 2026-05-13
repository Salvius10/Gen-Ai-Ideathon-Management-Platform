import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const mentors = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: { id: true, username: true, email: true },
    orderBy: { username: 'asc' },
  });
  res.json(mentors);
});

router.post('/assign', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { teamId, mentorId } = req.body;

  if (!teamId || !mentorId) {
    res.status(400).json({ message: 'Team ID and mentor ID are required' });
    return;
  }

  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor || mentor.role !== 'MENTOR') {
    res.status(400).json({ message: 'Invalid mentor' });
    return;
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    res.status(404).json({ message: 'Team not found' });
    return;
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: { mentorId },
    include: {
      mentor: { select: { id: true, username: true, email: true } },
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
    },
  });

  // Notify the mentor
  await prisma.notification.create({
    data: {
      userId: mentorId,
      title: 'Team Assigned',
      message: `You have been assigned as mentor for team "${team.name}".`,
    },
  });

  // Notify all team members
  const members = await prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } });
  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      title: 'Mentor Assigned',
      message: `${mentor.username} has been assigned as your team mentor.`,
    })),
  });

  res.json(updated);
});

router.get('/my-teams', authenticate, requireRole('MENTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    where: { mentorId: req.user!.userId },
    include: {
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      owner: { select: { id: true, username: true, email: true } },
      checkIn1: true,
      checkIn2: true,
      submission: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(teams);
});

export default router;
