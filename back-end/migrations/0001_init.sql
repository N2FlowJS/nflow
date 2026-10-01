-- N2Flow initial schema (PostgreSQL).
--
-- Type mapping from the `.an5` schema in `an5Schema/`:
--   NVARCHAR(n) / NVARCHAR(MAX)  -> TEXT
--   DATETIME2                    -> TIMESTAMPTZ
--   @default(uuid())             -> gen_random_uuid()  (the an5 adapter also
--                                    generates the id client-side on create)
--   @updatedAt                   -> an5_set_updated_at() trigger
--
-- Keep this file in sync with `an5Schema/*.an5`.

CREATE OR REPLACE FUNCTION an5_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS "users" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid(),
  "email"     TEXT        NOT NULL,
  "username"  TEXT        NOT NULL,
  "password"  TEXT        NOT NULL,
  "name"      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username");

DROP TRIGGER IF EXISTS "users_set_updated_at" ON "users";
CREATE TRIGGER "users_set_updated_at"
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION an5_set_updated_at();

CREATE TABLE IF NOT EXISTS "flows" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid(),
  "name"      TEXT        NOT NULL,
  "data"      TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "flows_userId_idx" ON "flows" ("userId");

DROP TRIGGER IF EXISTS "flows_set_updated_at" ON "flows";
CREATE TRIGGER "flows_set_updated_at"
  BEFORE UPDATE ON "flows"
  FOR EACH ROW EXECUTE FUNCTION an5_set_updated_at();

CREATE TABLE IF NOT EXISTS "flow_executions" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid(),
  "flowId"    TEXT        NOT NULL,
  "status"    TEXT        NOT NULL DEFAULT 'idle',
  "input"     TEXT,
  "output"    TEXT,
  "error"     TEXT,
  "startedAt" TIMESTAMPTZ,
  "endedAt"   TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "flow_executions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "flow_executions_flowId_idx" ON "flow_executions" ("flowId");

CREATE TABLE IF NOT EXISTS "user_secrets" (
  "id"         TEXT        NOT NULL DEFAULT gen_random_uuid(),
  "userId"     TEXT        NOT NULL,
  "name"       TEXT        NOT NULL,
  "key"        TEXT        NOT NULL,
  "label"      TEXT,
  "lastUsedAt" TIMESTAMPTZ,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "user_secrets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_secrets_key_key" ON "user_secrets" ("key");
CREATE UNIQUE INDEX IF NOT EXISTS "user_secrets_userId_name_key" ON "user_secrets" ("userId", "name");
CREATE INDEX IF NOT EXISTS "user_secrets_userId_idx" ON "user_secrets" ("userId");

DROP TRIGGER IF EXISTS "user_secrets_set_updated_at" ON "user_secrets";
CREATE TRIGGER "user_secrets_set_updated_at"
  BEFORE UPDATE ON "user_secrets"
  FOR EACH ROW EXECUTE FUNCTION an5_set_updated_at();

CREATE TABLE IF NOT EXISTS "llm_providers" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid(),
  "userId"    TEXT        NOT NULL,
  "name"      TEXT        NOT NULL,
  "provider"  TEXT        NOT NULL,
  "baseUrl"   TEXT,
  "apiKey"    TEXT,
  "config"    TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "llm_providers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "llm_providers_userId_idx" ON "llm_providers" ("userId");

DROP TRIGGER IF EXISTS "llm_providers_set_updated_at" ON "llm_providers";
CREATE TRIGGER "llm_providers_set_updated_at"
  BEFORE UPDATE ON "llm_providers"
  FOR EACH ROW EXECUTE FUNCTION an5_set_updated_at();

-- Added after 0001_init so the initial migration stays byte-identical to what
-- already ran in existing environments.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'flows_userId_fkey'
  ) THEN
    ALTER TABLE "flows" ADD CONSTRAINT "flows_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'flow_executions_flowId_fkey'
  ) THEN
    ALTER TABLE "flow_executions" ADD CONSTRAINT "flow_executions_flowId_fkey"
      FOREIGN KEY ("flowId") REFERENCES "flows" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_secrets_userId_fkey'
  ) THEN
    ALTER TABLE "user_secrets" ADD CONSTRAINT "user_secrets_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'llm_providers_userId_fkey'
  ) THEN
    ALTER TABLE "llm_providers" ADD CONSTRAINT "llm_providers_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
