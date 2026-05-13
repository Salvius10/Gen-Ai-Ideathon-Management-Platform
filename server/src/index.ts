import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import checkinRoutes from './routes/checkin';
import submissionRoutes from './routes/submission';
import evaluationRoutes from './routes/evaluation';
import mentorRoutes from './routes/mentors';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
