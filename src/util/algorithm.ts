export function times<T>(fn: () => T, n: number): T[] {
  const ops: T[] = [];
  for (let i = 0; i < n; ++i) {
    ops.push(fn());
  }
  return ops;
}
