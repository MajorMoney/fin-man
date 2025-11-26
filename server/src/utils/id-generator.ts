export function generateId(): number {
  return Math.floor(Date.now() + Math.random() * 1000);
}
