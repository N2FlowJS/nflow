import fs from 'node:fs/promises';
import path from 'node:path';
import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../../utils/common';

const WORKSPACE_ROOT = path.resolve(process.cwd(), 'storage');

const safeResolve = (userPath: string): string => {
  const resolved = path.resolve(WORKSPACE_ROOT, userPath);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error(`Security Error: Path ${userPath} is outside the allowed workspace.`);
  }
  return resolved;
};

export const filesystemHandler: ToolHandler = async (node, args) => {
  const action = String(getNodeFieldValue(node, 'action') || 'Read').toLowerCase();
  const rawPath = String(getNodeFieldValue(node, 'path') || args.path || './output.txt');
  const content = String(args.query || args.content || getNodeFieldValue(node, 'content') || '').replace('{query}', args.query || '');

  try {
    const finalPath = safeResolve(rawPath);
    
    // Ensure parent directory exists for write/append
    if (action === 'write' || action === 'append') {
      await fs.mkdir(path.dirname(finalPath), { recursive: true });
    }

    if (action === 'write') {
      await fs.writeFile(finalPath, content, 'utf-8');
      return `Successfully wrote to ${rawPath}`;
    } else if (action === 'append') {
      await fs.appendFile(finalPath, content, 'utf-8');
      return `Successfully appended to ${rawPath}`;
    } else {
      // Default to Read
      const data = await fs.readFile(finalPath, 'utf-8');
      return data;
    }
  } catch (e) {
    return `File System Error: ${String(e)}`;
  }
};
