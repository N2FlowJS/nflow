/*
  Warnings:

  - You are about to drop the column `ownerType` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "agentId" TEXT NOT NULL,
    "flowState" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("agentId", "createdAt", "flowState", "id", "lastMessageAt", "status", "title", "updatedAt") SELECT "agentId", "createdAt", "flowState", "id", "lastMessageAt", "status", "title", "updatedAt" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_agentId_idx" ON "Conversation"("agentId");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
