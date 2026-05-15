-- Split useCaseApproved into three per-use-case approval columns
ALTER TABLE "Team" RENAME COLUMN "useCaseApproved" TO "useCase1Approved";
ALTER TABLE "Team" ADD COLUMN "useCase2Approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Team" ADD COLUMN "useCase3Approved" BOOLEAN NOT NULL DEFAULT false;
