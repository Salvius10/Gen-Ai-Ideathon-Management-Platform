import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole('JUDGE'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { teamId, technicality, wowFactor, creativity, useCase, comments } = req.body;
  const judgeId = req.user!.userId;

  if (!teamId) {
    res.status(400).json({ message: 'Team ID is required' });
    return;
  }

  const scores = [technicality, wowFactor, creativity, useCase];
  if (scores.some((s) => s === undefined || s === null || s < 0 || s > 100)) {
    res.status(400).json({ message: 'Each score must be between 0 and 100' });
    return;
  }

  const submission = await prisma.submission.findUnique({ where: { teamId } });
  if (!submission) {
    res.status(400).json({ message: 'Team has not submitted their final project yet' });
    return;
  }

  const total = technicality + wowFactor + creativity + useCase;

  const evaluation = await prisma.evaluation.upsert({
    where: { teamId_judgeId: { teamId, judgeId } },
    update: { technicality, wowFactor, creativity, useCase, total, comments },
    create: { teamId, judgeId, technicality, wowFactor, creativity, useCase, total, comments },
    include: {
      team: { select: { name: true } },
      judge: { select: { username: true } },
    },
  });

  // Notify team members
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });
  await prisma.notification.createMany({
    data: teamMembers.map((m) => ({
      userId: m.userId,
      title: 'Your Project Has Been Evaluated',
      message: `A judge has evaluated your project. Total score: ${total}/400.`,
    })),
  });

  res.json(evaluation);
});

router.get('/results', async (_req, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    where: { submission: { isNot: null } },
    include: {
      evaluations: true,
      members: { include: { user: { select: { id: true, username: true, email: true } } } },
      owner: { select: { id: true, username: true } },
      submission: true,
    },
  });

  const results = teams
    .map((team) => {
      if (team.evaluations.length === 0) return null;

      const avgTechnicality = Math.round(
        team.evaluations.reduce((s, e) => s + e.technicality, 0) / team.evaluations.length
      );
      const avgWowFactor = Math.round(
        team.evaluations.reduce((s, e) => s + e.wowFactor, 0) / team.evaluations.length
      );
      const avgCreativity = Math.round(
        team.evaluations.reduce((s, e) => s + e.creativity, 0) / team.evaluations.length
      );
      const avgUseCase = Math.round(
        team.evaluations.reduce((s, e) => s + e.useCase, 0) / team.evaluations.length
      );
      const avgTotal = avgTechnicality + avgWowFactor + avgCreativity + avgUseCase;

      return {
        team: {
          id: team.id,
          name: team.name,
          problemStatement: team.problemStatement,
          description: team.description,
          members: team.members,
          owner: team.owner,
          submission: team.submission,
        },
        scores: {
          technicality: avgTechnicality,
          wowFactor: avgWowFactor,
          creativity: avgCreativity,
          useCase: avgUseCase,
          total: avgTotal,
        },
        judgeCount: team.evaluations.length,
      };
    })
    .filter(Boolean);

  // Sort by total DESC; tiebreak by technicality DESC
  results.sort((a, b) => {
    if (!a || !b) return 0;
    if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
    return b.scores.technicality - a.scores.technicality;
  });

  const ranked = results.map((r, i) => ({ ...r!, rank: i + 1 }));
  res.json(ranked);
});

router.get('/my', authenticate, requireRole('JUDGE'), async (req: AuthRequest, res: Response): Promise<void> => {
  const evaluations = await prisma.evaluation.findMany({
    where: { judgeId: req.user!.userId },
    include: {
      team: {
        select: { id: true, name: true, problemStatement: true, submission: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(evaluations);
});

router.get('/team/:teamId', authenticate, requireRole('JUDGE', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  const evaluations = await prisma.evaluation.findMany({
    where: { teamId: req.params.teamId },
    include: { judge: { select: { id: true, username: true } } },
  });
  res.json(evaluations);
});

export default router;
