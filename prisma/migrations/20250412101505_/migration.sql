-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "providerType" TEXT NOT NULL,
    "endpointUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerType" TEXT NOT NULL DEFAULT 'system',
    "config" JSONB,
    "userOwnerId" TEXT,
    "teamOwnerId" TEXT,
    "permissionSettings" JSONB,
    CONSTRAINT "LLMProvider_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LLMProvider_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LLMProvider" ("apiKey", "config", "createdAt", "description", "endpointUrl", "id", "isActive", "isDefault", "name", "providerType", "updatedAt") SELECT "apiKey", "config", "createdAt", "description", "endpointUrl", "id", "isActive", "isDefault", "name", "providerType", "updatedAt" FROM "LLMProvider";
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
    "defaultLLMProviderId" TEXT,
    "llmPreferences" JSONB,
    CONSTRAINT "User_defaultLLMProviderId_fkey" FOREIGN KEY ("defaultLLMProviderId") REFERENCES "LLMProvider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("code", "createdAt", "description", "email", "id", "name", "password", "permission", "updatedAt") SELECT "code", "createdAt", "description", "email", "id", "name", "password", "permission", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
