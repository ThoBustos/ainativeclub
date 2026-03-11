/** Format a dollar ARR value: $38000 → "$38K", $1500000 → "$1.5M" */
export function fmtArr(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  return `$${Math.round(n / 1000)}K`;
}
