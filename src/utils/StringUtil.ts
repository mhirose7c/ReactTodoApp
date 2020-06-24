export function parseStringToNumber(target: string | undefined): number {
  return target ? parseInt(target) : -1;
}
