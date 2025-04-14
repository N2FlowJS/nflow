-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LLMProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_LLMProvider" ("apiKey", "config", "createdAt", "endpointUrl", "id", "isActive", "isDefault", "ownerType", "permissionSettings", "providerType", "teamOwnerId", "updatedAt", "userOwnerId") SELECT "apiKey", "config", "createdAt", "endpointUrl", "id", "isActive", "isDefault", "ownerType", "permissionSettings", "providerType", "teamOwnerId", "updatedAt", "userOwnerId" FROM "LLMProvider";
DROP TABLE "LLMProvider";
ALTER TABLE "new_LLMProvider" RENAME TO "LLMProvider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
