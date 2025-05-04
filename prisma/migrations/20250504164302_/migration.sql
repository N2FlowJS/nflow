-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "modelId" TEXT,
    CONSTRAINT "Knowledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Knowledge_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "LLMModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Knowledge" ("config", "createdAt", "description", "id", "name", "updatedAt", "userId") SELECT "config", "createdAt", "description", "id", "name", "updatedAt", "userId" FROM "Knowledge";
DROP TABLE "Knowledge";
ALTER TABLE "new_Knowledge" RENAME TO "Knowledge";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
