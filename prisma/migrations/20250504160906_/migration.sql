/*
  Warnings:

  - You are about to drop the column `isActive` on the `LLMProvider` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerType" TEXT NOT NULL,
    "endpointUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerType" TEXT NOT NULL DEFAULT 'user',
    "userOwnerId" TEXT,
    "teamOwnerId" TEXT,
    CONSTRAINT "LLMProvider_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LLMProvider_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LLMProvider" ("apiKey", "createdAt", "endpointUrl", "id", "ownerType", "providerType", "teamOwnerId", "updatedAt", "userOwnerId") SELECT coalesce("apiKey", '') AS "apiKey", "createdAt", "endpointUrl", "id", "ownerType", "providerType", "teamOwnerId", "updatedAt", "userOwnerId" FROM "LLMProvider";
DROP TABLE "LLMProvider";
ALTER TABLE "new_LLMProvider" RENAME TO "LLMProvider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
