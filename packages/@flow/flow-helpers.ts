import { Position } from '@xyflow/react';
// Re-export selected input reference helpers here for plugin/runtime usage
export { getInputs, getQueryFromSource } from '../../hooks/useInputReferences';

export const getPositionFromHandleId = (handleId?: string | null): Position | null => {
  if (!handleId) return null;
  const parts = handleId.split('-');
  if (parts.length >= 3) {
    const pos = parts[1] as keyof typeof Position;
    if (pos in Position) {
      return Position[pos];
    }
  }
  return null;
};

export const getOppositePosition = (pos: Position): Position => {
  switch (pos) {
    case Position.Left:
      return Position.Right;
    case Position.Right:
      return Position.Left;
    case Position.Top:
      return Position.Bottom;
    case Position.Bottom:
    default:
      return Position.Top;
  }
};

export const slugify = (s: string) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
