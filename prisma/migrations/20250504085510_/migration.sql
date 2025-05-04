/*
  Warnings:

  - You are about to drop the column `config` on the `LLMModel` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `LLMModel` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `LLMModel` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `LLMModel` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `LLMProvider` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `LLMProvider` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `LLMProvider` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LLMProvider` table. All the data in the column will be lost.
  - You are about to drop the column `permissionSettings` on the `LLMProvider` table. All the data in the column will be lost.
  - You are about to drop the column `defaultLLMProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `llmPreferences` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "contextWindow" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT NOT NULL,
    CONSTRAINT "LLMModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LLMProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LLMModel" ("contextWindow", "createdAt", "id", "isDefault", "modelType", "name", "providerId", "updatedAt") SELECT "contextWindow", "createdAt", "id", "isDefault", "modelType", "name", "providerId", "updatedAt" FROM "LLMModel";
DROP TABLE "LLMModel";
ALTER TABLE "new_LLMModel" RENAME TO "LLMModel";
CREATE TABLE "new_LLMProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerType" TEXT NOT NULL,
    "endpointUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerType" TEXT NOT NULL DEFAULT 'user',
    "userOwnerId" TEXT,
    "teamOwnerId" TEXT,
    CONSTRAINT "LLMProvider_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LLMProvider_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LLMProvider" ("apiKey", "createdAt", "endpointUrl", "id", "isActive", "ownerType", "providerType", "teamOwnerId", "updatedAt", "userOwnerId") SELECT "apiKey", "createdAt", "endpointUrl", "id", "isActive", "ownerType", "providerType", "teamOwnerId", "updatedAt", "userOwnerId" FROM "LLMProvider";
DROP TABLE "LLMProvider";
ALTER TABLE "new_LLMProvider" RENAME TO "LLMProvider";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'guest',
    "lmmConfig" JSONB
);
INSERT INTO "new_User" ("code", "createdAt", "description", "email", "id", "name", "password", "permission", "updatedAt") SELECT "code", "createdAt", "description", "email", "id", "name", "password", "permission", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
