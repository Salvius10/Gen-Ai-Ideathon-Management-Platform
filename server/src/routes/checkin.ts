import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

async function getTeamForUser(userId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: true },
  });
  return member?.team ?? null;
}

// ─── Check-In 1 ───────────────────────────────────────────────────────────────

router.post('/1', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { techStack, workflow, approach } = req.body;
  const userId = req.user!.userId;

  if (!techStack || !workflow || !approach) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const team = await getTeamForUser(userId);
  if (!team) {
    res.status(400).json({ message: 'You must be in a team to submit check-in' });
    return;
  }

  if (!team.mentorId) {
    res.status(400).json({ message: 'A mentor must be assigned before check-in 1' });
    return;
  }

  const checkIn = await prisma.checkIn1.upsert({
    where: { teamId: team.id },
    update: { techStack, workflow, approach },
    create: { teamId: team.id, techStack, workflow, approach },
  });

  // Notify mentor
  if (team.mentorId) {
    await prisma.notification.create({
      data: {
        userId: team.mentorId,
        title: 'Check-In 1 Submitted',
        message: `Team "${team.name}" submitted their Check-In 1.`,
      },
    });
  }

  res.json(checkIn);
});

router.get('/1/:teamId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const checkIn = await prisma.checkIn1.findUnique({ where: { teamId: req.params.teamId } });
  if (!checkIn) {
    res.status(404).json({ message: 'Check-In 1 not found' });
    return;
  }
  res.json(checkIn);
});

// ─── Check-In 2 ───────────────────────────────────────────────────────────────

router.post('/2', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { githubLink, workflowStatus, progressUpdate } = req.body;
  const userId = req.user!.userId;

  if (!githubLink || !workflowStatus || !progressUpdate) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const team = await getTeamForUser(userId);
  if (!team) {
    res.status(400).json({ message: 'You must be in a team to submit check-in' });
    return;
  }

  const checkIn1 = await prisma.checkIn1.findUnique({ where: { teamId: team.id } });
  if (!checkIn1) {
    res.status(400).json({ message: 'Check-In 1 must be submitted first' });
    return;
  }

  const checkIn = await prisma.checkIn2.upsert({
    where: { teamId: team.id },
    update: { githubLink, workflowStatus, progressUpdate },
    create: { teamId: team.id, githubLink, workflowStatus, progressUpdate },
  });

  if (team.mentorId) {
    await prisma.notification.create({
      data: {
        userId: team.mentorId,
        title: 'Check-In 2 Submitted',
        message: `Team "${team.name}" submitted their Check-In 2.`,
      },
    });
  }

  res.json(checkIn);
});

router.get('/2/:teamId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const checkIn = await prisma.checkIn2.findUnique({ where: { teamId: req.params.teamId } });
  if (!checkIn) {
    res.status(404).json({ message: 'Check-In 2 not found' });
    return;
  }
  res.json(checkIn);
});

export default router;
