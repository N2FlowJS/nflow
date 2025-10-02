# Migration TODO - Config to InputPort

## Summary
66 packages need to be migrated from `config` pattern to `InputPort` pattern.
This is a BREAKING CHANGE - no backward compatibility.

## Status Overview
- ✅ **Completed: 21 packages**
- ⚠️ **In Progress: 3 packages** (needs fixes)
- ❌ **Pending: 45 packages**

### ✅ Completed (21 packages)
- [x] `packages/promt` - Reference implementation
- [x] `packages/log-analysis` - Fixed getDynamicInputs

**Priority 1 - Core Nodes (7/7)** ✅
- [x] `packages/agent`
- [x] `packages/begin`
- [x] `packages/generate`
- [x] `packages/http-request`
- [x] `packages/display`
- [x] `packages/condition`
- [x] `packages/variable`

**Priority 2 - File & Data Transform (6/6)** ✅
- [x] `packages/file-read`
- [x] `packages/file-write`
- [x] `packages/retrieval`
- [x] `packages/transform`
- [x] `packages/json-parse`
- [x] `packages/text-process`

**Priority 3 - Integration Nodes (5/5)** ✅
- [x] `packages/slack`
- [x] `packages/discord`
- [x] `packages/telegram`
- [x] `packages/sendmail`
- [x] `packages/webhook`

### ⚠️ In Progress (3 packages)
- [ ] `packages/keywords` - Has syntax errors, needs manual fix
- [ ] `packages/native-keywords` - Missing `id` in ports
- [ ] `packages/mattermost` - Config still present

### ❌ Pending Migration (45 packages)

#### Priority 4 - Database Nodes
- [ ] `packages/exec-mysql`
- [ ] `packages/exec-postgres`
- [ ] `packages/exec-mssql`
- [ ] `packages/prisma-read`

#### Priority 5 - AI/Search Nodes
- [ ] `packages/google-search`
- [ ] `packages/bing-search`
- [ ] `packages/duckgo-search`
- [ ] `packages/wikipedia-search`

#### Priority 6 - Analysis Nodes
- [ ] `packages/csv-analysis`
- [ ] `packages/excel-analysis`
- [ ] `packages/file-analysis`
- [ ] `packages/image-analysis`
- [ ] `packages/pdf-analysis`

#### Priority 7 - Social Media Nodes
- [ ] `packages/facebook`
- [ ] `packages/twitter`
- [ ] `packages/linkedin`
- [ ] `packages/instagram`
- [ ] `packages/tiktok`
- [ ] `packages/youtube`

#### Priority 8 - DevOps/Tools
- [ ] `packages/github`
- [ ] `packages/gitlab`
- [ ] `packages/jira`
- [ ] `packages/confluence`

#### Priority 9 - Other
- [ ] `packages/agent-tools`
- [ ] `packages/cache`
- [ ] `packages/code`
- [ ] `packages/counter`
- [ ] `packages/datetime`
- [ ] `packages/decision`
- [ ] `packages/delay`
- [ ] `packages/google-map`
- [ ] `packages/log`
- [ ] `packages/loop`
- [ ] `packages/math`
- [ ] `packages/subagent`
- [ ] `packages/validate`
- [ ] `packages/weather`
- [ ] `packages/web-click`
- [ ] `packages/web-open`
- [ ] `packages/web-typing`
- [ ] `packages/wechat`

## Migration Pattern

For each package, follow these steps:

### 1. Update definition.ts
```typescript
// OLD
config: {
  properties: {
    myField: { type: 'string', title: 'My Field', default: 'value' }
  }
}

// NEW
inputs: [
  {
    id: 'myField',
    name: 'My Field',
    type: PortType.TEXT,
    defaultValue: 'value',
    required: true,
    metadata: { inputType: 'text' }
  }
]
```

### 2. Update node/index.tsx
```typescript
export { DynamicNode as default } from '@n2flowjs/flow/node/DynamicNode';
```

### 3. Update form/index.tsx
```typescript
export { DynamicForm as default } from '@n2flowjs/flow/form/DynamicForm';
```

### 4. Fix getDynamicInputs (if present)
```typescript
getDynamicInputs: (config) => {
  const variableNames = getInputFromTemplate(config.someField);
  return variableNames.map(varName => ({
    id: varName,
    name: varName,
    type: PortType.TEXT,
    metadata: { isDynamic: true }
  }));
}
```

### 5. Fix execution status
```typescript
// Replace status: 'waiting' with:
if (missingInputs.length > 0) {
  return {
    outputs: { /* empty */ },
    status: 'success',
    metadata: { waitingFor: missingInputs }
  };
}
```

## Automation

```bash
# Check migration status
node scripts/migrate-to-inputport.cjs --all

# Auto-fix common issues
node scripts/fix-definition-issues.cjs --all

# Run type check
npm run typecheck
```

## Reference

See complete example: `packages/promt/definition.ts`
See migration guide: `docs/MIGRATION-INPUTPORT.md`

## Notes

- This is a BREAKING change - no backward compatibility
- All packages MUST be migrated before build will succeed
- Dynamic form generation requires `metadata.inputType`
- Template variables automatically create dynamic input ports

## Timeline

- **Phase 1** (Current): Core infrastructure complete
- **Phase 2** (Next): Migrate Priority 1-2 packages (10 packages)
- **Phase 3**: Migrate Priority 3-4 packages (15 packages)
- **Phase 4**: Migrate remaining packages (40 packages)
- **Phase 5**: Remove deprecated code paths

## Current Blockers

1. **Build fails** - Too many packages with `config`
2. **Type errors** - 50+ packages need migration
3. **Manual work** - Each package needs careful review

## Solution Paths

### Option A: Gradual Migration (Current)
- Migrate packages one-by-one
- Test each package
- Time: ~3-5 days

### Option B: Batch Migration Script
- Create sophisticated parser
- Auto-convert all packages
- Risk: May miss edge cases
- Time: ~1 day + testing

### Option C: Temporary Compatibility Layer
- Re-add `config` as deprecated
- Convert config to inputs at runtime
- Time: ~2 hours
- Downside: Technical debt

## Recommendation

**Option C for now** - Add temporary compatibility layer to unblock development,
then gradually migrate packages (Option A) over time.

This allows:
1. Build to succeed immediately
2. New packages use InputPort pattern
3. Old packages work during migration
4. Clean removal once migration complete
