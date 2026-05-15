export type Role = 'PARTICIPANT' | 'MENTOR' | 'JUDGE' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  team?: Team | null;
}

export interface TeamMemberUser {
  id: string;
  username: string;
  email: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  user: TeamMemberUser;
}

export interface CheckIn1 {
  id: string;
  teamId: string;
  techStack: string;
  workflow: string;
  approach: string;
  submittedAt: string;
  updatedAt: string;
}

export interface CheckIn2 {
  id: string;
  teamId: string;
  githubLink: string;
  workflowStatus: string;
  progressUpdate: string;
  submittedAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  teamId: string;
  sharepointLink: string;
  description: string;
  submittedAt: string;
  locked: boolean;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  useCase1: string;
  useCase2: string;
  useCase3: string;
  useCaseApproved: boolean;
  description: string;
  ownerId: string;
  mentorId?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: TeamMemberUser;
  mentor?: TeamMemberUser | null;
  members?: TeamMember[];
  checkIn1?: CheckIn1 | null;
  checkIn2?: CheckIn2 | null;
  submission?: Submission | null;
}

export interface Evaluation {
  id: string;
  teamId: string;
  judgeId: string;
  technicality: number;
  wowFactor: number;
  creativity: number;
  useCase: number;
  total: number;
  comments?: string | null;
  createdAt: string;
  team?: Pick<Team, 'id' | 'name' | 'useCase1' | 'useCase2' | 'useCase3'> & { submission?: Submission | null };
  judge?: { id: string; username: string };
}

export interface EvaluationResult {
  rank: number;
  team: Pick<Team, 'id' | 'name' | 'useCase1' | 'useCase2' | 'useCase3' | 'useCaseApproved' | 'description'> & {
    members: TeamMember[];
    owner: TeamMemberUser;
    submission: Submission | null;
  };
  scores: {
    technicality: number;
    wowFactor: number;
    creativity: number;
    useCase: number;
    total: number;
  };
  judgeCount: number;
}

export interface LeaderboardEntry {
  team: {
    id: string;
    name: string;
    useCase1: string;
    useCase2: string;
    useCase3: string;
    useCaseApproved: boolean;
    members: TeamMember[];
    owner: TeamMemberUser;
    mentor: TeamMemberUser | null;
    memberCount: number;
    needsMoreMembers: boolean;
    supportEmail: string;
  };
  scores: {
    technicality: number;
    wowFactor: number;
    creativity: number;
    useCase: number;
    total: number;
  } | null;
  judgeCount: number;
}

export interface EventConfig {
  event: string;
  label: string;
  isOpen: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTeams: number;
  totalSubmissions: number;
  totalEvaluations: number;
  byRole: Record<string, number>;
}
