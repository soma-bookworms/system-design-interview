import { create } from 'zustand'
import { hashToAngle, findAssignedServer } from './hash'

export interface Server {
  id: string
  name: string
  color: string
  angle: number
  virtualAngles: number[]
}

export interface Key {
  id: string
  name: string
  angle: number
}

const COLORS = [
  '#EF4444', '#22D3EE', '#FACC15', '#A78BFA', '#34D399',
  '#F97316', '#EC4899', '#06B6D4', '#84CC16', '#F59E0B',
]
const MAX_SERVERS = 10

interface Store {
  servers: Server[]
  keys: Key[]
  virtualNodeCount: number
  currentPage: number
  nextKeyId: number
  addServer: () => Promise<void>
  removeServer: (id?: string) => void
  addKey: () => Promise<void>
  addKeys: (count: number) => Promise<void>
  removeAllKeys: () => void
  setVirtualNodeCount: (count: number) => void
  setPage: (page: number) => void
  reset: () => void
}

export const useStore = create<Store>((set, get) => ({
  servers: [],
  keys: [],
  virtualNodeCount: 0,
  currentPage: 0,
  nextKeyId: 0,

  addServer: async () => {
    const { servers } = get()
    if (servers.length >= MAX_SERVERS) return
    const idx = servers.length
    const name = `S${idx}`
    const angle = await hashToAngle(name)
    const virtualAngles = await Promise.all(
      Array.from({ length: 4 }, (_, i) => hashToAngle(`${name}_v${i + 1}`)),
    )
    set((s) => ({
      servers: [
        ...s.servers,
        { id: name, name, color: COLORS[idx], angle, virtualAngles },
      ],
    }))
  },

  removeServer: (id?: string) => {
    set((s) => {
      if (s.servers.length === 0) return s
      const target = id ?? s.servers[s.servers.length - 1].id
      return { servers: s.servers.filter((sv) => sv.id !== target) }
    })
  },

  addKey: async () => {
    const { nextKeyId } = get()
    const name = `k${nextKeyId}`
    const angle = await hashToAngle(name)
    set((s) => ({
      keys: [...s.keys, { id: name, name, angle }],
      nextKeyId: s.nextKeyId + 1,
    }))
  },

  addKeys: async (count: number) => {
    let { nextKeyId } = get()
    const newKeys: Key[] = []
    for (let i = 0; i < count; i++) {
      const name = `k${nextKeyId + i}`
      const angle = await hashToAngle(name)
      newKeys.push({ id: name, name, angle })
    }
    set((s) => ({
      keys: [...s.keys, ...newKeys],
      nextKeyId: s.nextKeyId + count,
    }))
  },

  removeAllKeys: () => set({ keys: [], nextKeyId: 0 }),

  setVirtualNodeCount: (count: number) => set({ virtualNodeCount: count }),

  setPage: (page: number) => set({ currentPage: page }),

  reset: () =>
    set({
      servers: [],
      keys: [],
      virtualNodeCount: 0,
      nextKeyId: 0,
    }),
}))

async function initServers() {
  const store = useStore.getState()
  if (store.servers.length > 0) return
  for (let i = 0; i < 4; i++) {
    await store.addServer()
  }
}
initServers()

export function getAllNodes(servers: Server[], virtualNodeCount: number) {
  const nodes: { angle: number; serverId: string; isVirtual: boolean }[] = []
  for (const s of servers) {
    nodes.push({ angle: s.angle, serverId: s.id, isVirtual: false })
    for (let i = 0; i < virtualNodeCount; i++) {
      nodes.push({
        angle: s.virtualAngles[i],
        serverId: s.id,
        isVirtual: true,
      })
    }
  }
  return nodes
}

export function getKeyAssignment(
  key: Key,
  servers: Server[],
  virtualNodeCount: number,
): string | null {
  const nodes = getAllNodes(servers, virtualNodeCount)
  return findAssignedServer(key.angle, nodes)
}

export function getServerColor(
  servers: Server[],
  serverId: string | null,
): string {
  if (!serverId) return '#666'
  return servers.find((s) => s.id === serverId)?.color ?? '#666'
}

export function getArcs(servers: Server[], virtualNodeCount: number) {
  const nodes = getAllNodes(servers, virtualNodeCount)
  if (nodes.length === 0) return []
  const sorted = [...nodes].sort((a, b) => a.angle - b.angle)
  const arcs: { startAngle: number; endAngle: number; serverId: string; color: string }[] = []
  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i]
    const prev = sorted[(i - 1 + sorted.length) % sorted.length]
    const startAngle = prev.angle
    const endAngle = node.angle
    const color = getServerColor(servers, node.serverId)
    arcs.push({ startAngle, endAngle, serverId: node.serverId, color })
  }
  return arcs
}
