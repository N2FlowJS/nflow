export function normalizeKey(name: string) {
  return (name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export default normalizeKey;
