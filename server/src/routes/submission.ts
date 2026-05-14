import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = Router();

async function getTeamForUser(userId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: true },
  });
  return member?.team ?? null;
}

const SUBMISSIONS_DIR = path.join(process.cwd(), 'submissions');
const SUBMISSIONS_CSV = path.join(SUBMISSIONS_DIR, 'sharepoint-links.csv');

function appendSubmissionToFile(teamName: string, sharepointLink: string, description: string) {
  if (!fs.existsSync(SUBMISSIONS_DIR)) fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
  const isNew = !fs.existsSync(SUBMISSIONS_CSV);
  const row = `"${new Date().toISOString()}","${teamName.replace(/"/g, '""')}","${sharepointLink.replace(/"/g, '""')}","${description.replace(/"/g, '""').replace(/\n/g, ' ')}"\n`;
  if (isNew) fs.writeFileSync(SUBMISSIONS_CSV, 'submittedAt,teamName,sharepointLink,description\n');
  fs.appendFileSync(SUBMISSIONS_CSV, row);
}

router.post('/', authenticate, requireRole('PARTICIPANT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { sharepointLink, description } = req.body;
  const userId = req.user!.userId;

  if (!sharepointLink || !description) {
    res.status(400).json({ message: 'SharePoint link and description are required' });
    return;
  }

  if (!sharepointLink.startsWith('https://')) {
    res.status(400).json({ message: 'Please provide a valid SharePoint URL' });
    return;
  }

  const team = await getTeamForUser(userId);
  if (!team) {
    res.status(400).json({ message: 'You must be in a team to submit' });
    return;
  }

  const existing = await prisma.submission.findUnique({ where: { teamId: team.id } });
  if (existing?.locked) {
    res.status(403).json({ message: 'Final submission is locked and cannot be modified' });
    return;
  }

  const checkIn2 = await prisma.checkIn2.findUnique({ where: { teamId: team.id } });
  if (!checkIn2) {
    res.status(400).json({ message: 'Check-In 2 must be completed before final submission' });
    return;
  }

  const submission = await prisma.submission.upsert({
    where: { teamId: team.id },
    update: { sharepointLink, description, locked: true },
    create: { teamId: team.id, sharepointLink, description, locked: true },
  });

  appendSubmissionToFile(team.name, sharepointLink, description);

  // Notify admin and judges
  const notifyUsers = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'JUDGE'] } },
  });
  await prisma.notification.createMany({
    data: notifyUsers.map((u) => ({
      userId: u.id,
      title: 'Final Submission Received',
      message: `Team "${team.name}" has submitted their final project.`,
    })),
  });

  res.json(submission);
});

router.get('/:teamId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const submission = await prisma.submission.findUnique({ where: { teamId: req.params.teamId } });
  if (!submission) {
    res.status(404).json({ message: 'Submission not found' });
    return;
  }
  res.json(submission);
});

router.get('/', authenticate, requireRole('JUDGE', 'ADMIN'), async (_req: AuthRequest, res: Response): Promise<void> => {
  const submissions = await prisma.submission.findMany({
    include: {
      team: {
        include: {
          members: { include: { user: { select: { id: true, username: true, email: true } } } },
          mentor: { select: { id: true, username: true, email: true } },
          owner: { select: { id: true, username: true } },
          evaluations: {
            select: {
              judgeId: true,
              total: true,
              judge: { select: { id: true, username: true } },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });
  res.json(submissions);
});

export default router;
