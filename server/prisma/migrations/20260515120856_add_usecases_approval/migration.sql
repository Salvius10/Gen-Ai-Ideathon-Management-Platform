-- AlterTable: Replace problemStatement with useCase1/2/3 and add useCaseApproved
ALTER TABLE "Team" RENAME COLUMN "problemStatement" TO "useCase1";

ALTER TABLE "Team" ADD COLUMN "useCase2" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Team" ADD COLUMN "useCase3" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Team" ADD COLUMN "useCaseApproved" BOOLEAN NOT NULL DEFAULT false;
