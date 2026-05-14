-- Create EventConfig table for admin event control
CREATE TABLE "EventConfig" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventConfig_event_key" ON "EventConfig"("event");

-- Seed the 4 default events (all closed)
INSERT INTO "EventConfig" ("id", "event", "label", "isOpen", "updatedAt") VALUES
  ('evt_team_reg',   'TEAM_REGISTRATION', 'Team Registration',  false, NOW()),
  ('evt_checkin1',   'CHECKIN_1',         'Check-In 1',         false, NOW()),
  ('evt_checkin2',   'CHECKIN_2',         'Check-In 2',         false, NOW()),
  ('evt_submission', 'FINAL_SUBMISSION',  'Final Submission',   false, NOW());
