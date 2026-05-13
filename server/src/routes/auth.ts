import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Username, email, and password are required' });
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    res.status(409).json({ message: 'Username or email already taken' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashed, role: 'PARTICIPANT' },
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      ownedTeam: {
        include: {
          members: { include: { user: { select: { id: true, username: true, email: true } } } },
          mentor: { select: { id: true, username: true, email: true } },
          checkIn1: true,
          checkIn2: true,
          submission: true,
        },
      },
      teamMembership: {
        include: {
          team: {
            include: {
              members: { include: { user: { select: { id: true, username: true, email: true } } } },
              mentor: { select: { id: true, username: true, email: true } },
              owner: { select: { id: true, username: true, email: true } },
              checkIn1: true,
              checkIn2: true,
              submission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const team = user.ownedTeam ?? user.teamMembership?.team ?? null;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    team,
  });
});

export default router;
