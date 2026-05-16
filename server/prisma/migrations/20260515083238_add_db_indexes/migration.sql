-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "useCase2" DROP DEFAULT,
ALTER COLUMN "useCase3" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Evaluation_judgeId_idx" ON "Evaluation"("judgeId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Team_mentorId_idx" ON "Team"("mentorId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
