export function uid(prefix = ''): string {
  // UUID-like without external deps (suficiente para util local)
  const s = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...s].map(b => b.toString(16).padStart(2,'0')).join('');
  return prefix + hex;
}
