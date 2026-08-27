export async function hashToAngle(input: string): Promise<number> {
  const data = new TextEncoder().encode(input)
  const buffer = await crypto.subtle.digest('SHA-1', data)
  const view = new DataView(buffer)
  const value = view.getUint32(0)
  return (value / 0xffffffff) * 360
}

export function angleToPosition(
  angle: number,
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function findAssignedServer(
  keyAngle: number,
  nodes: { angle: number; serverId: string }[],
): string | null {
  if (nodes.length === 0) return null
  const sorted = [...nodes].sort((a, b) => a.angle - b.angle)
  for (const node of sorted) {
    if (node.angle >= keyAngle) return node.serverId
  }
  return sorted[0].serverId
}
