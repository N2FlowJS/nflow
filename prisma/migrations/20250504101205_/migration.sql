/*
  Warnings:

  - You are about to drop the column `isDefault` on the `LLMModel` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "contextWindow" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT NOT NULL,
    CONSTRAINT "LLMModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LLMProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LLMModel" ("contextWindow", "createdAt", "id", "modelType", "name", "providerId", "updatedAt") SELECT "contextWindow", "createdAt", "id", "modelType", "name", "providerId", "updatedAt" FROM "LLMModel";
DROP TABLE "LLMModel";
ALTER TABLE "new_LLMModel" RENAME TO "LLMModel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
