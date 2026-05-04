import fs from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma';

/**
 * Migration script to import flows from JSON files to Prisma database
 * Usage: npx tsx scripts/migrateFlows.ts
 */

const FLOWS_DIR = path.join(process.cwd(), 'flows');

// Default user for legacy flows
const DEFAULT_USER_ID = 'system-migration';

async function migrateFlows() {
  console.log('[Migration] Starting flow migration from JSON files to database...');
  
  try {
    // Ensure default user exists
    let user = await prisma.user.findUnique({
      where: { username: DEFAULT_USER_ID },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${DEFAULT_USER_ID}@system.local`,
          username: DEFAULT_USER_ID,
          password: 'system', // Not used but required
          name: 'System Migration',
        },
      });
      console.log('[Migration] Created system user for legacy flows');
    }

    // Read flows directory
    const files = await fs.readdir(FLOWS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');

    console.log(`[Migration] Found ${jsonFiles.length} flow files to migrate`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(FLOWS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const flowData = JSON.parse(content);

        if (!flowData.id) {
          console.warn(`[Migration] Skipping ${file}: no ID found`);
          skipped++;
          continue;
        }

        // Check if flow already exists in database
        const existing = await prisma.flow.findUnique({
          where: { id: flowData.id },
        });

        if (existing) {
          console.log(`[Migration] Flow ${flowData.id} already exists in database, skipping...`);
          skipped++;
          continue;
        }

        // Import to database
        await prisma.flow.create({
          data: {
            id: flowData.id,
            name: flowData.name || flowData.id,
            userId: user.id,
            data: JSON.stringify(flowData.data || { nodes: [], edges: [], versions: [] }),
          },
        });

        console.log(`[Migration] ✓ Imported flow: ${flowData.id} (${flowData.name})`);
        imported++;
      } catch (error) {
        console.error(`[Migration] ✗ Error importing ${file}:`, error instanceof Error ? error.message : error);
        errors++;
      }
    }

    console.log(`\n[Migration] Migration complete!`);
    console.log(`  - Imported: ${imported}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Errors: ${errors}`);

    // Summary stats
    const totalFlows = await prisma.flow.count();
    console.log(`\n[Migration] Total flows in database: ${totalFlows}`);
  } catch (err) {
    console.error('[Migration] Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateFlows();
