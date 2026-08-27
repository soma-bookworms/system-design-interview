import { useState, useCallback } from 'react'
import { useStore, getKeyAssignment } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, {
  ActionButton,
  BulkKeyInput,
  SectionLabel,
  ServerList,
} from '../components/PageLayout'
import { getAllNodes } from '../store'

export default function P6VirtualNodes() {
  const servers = useStore((s) => s.servers)
  const keys = useStore((s) => s.keys)
  const virtualNodeCount = useStore((s) => s.virtualNodeCount)
  const setVirtualNodeCount = useStore((s) => s.setVirtualNodeCount)
  const addServer = useStore((s) => s.addServer)
  const addKeys = useStore((s) => s.addKeys)

  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [lookupArrow, setLookupArrow] = useState<{
    fromAngle: number
    toAngle: number
    color: string
  } | null>(null)

  const handleKeyClick = useCallback(
    (keyId: string) => {
      const key = keys.find((k) => k.id === keyId)
      if (!key) return
      const allNodes = getAllNodes(servers, virtualNodeCount)
      const serverId = getKeyAssignment(key, servers, virtualNodeCount)
      if (!serverId) return
      const server = servers.find((s) => s.id === serverId)
      if (!server) return
      const targetNode = allNodes
        .filter((n) => n.serverId === serverId)
        .sort((a, b) => {
          let da = a.angle - key.angle; if (da < 0) da += 360
          let db = b.angle - key.angle; if (db < 0) db += 360
          return da - db
        })[0]
      setSelectedKeyId(keyId)
      setLookupArrow({
        fromAngle: key.angle,
        toAngle: targetNode?.angle ?? server.angle,
        color: server.color,
      })
    },
    [keys, servers, virtualNodeCount],
  )

  const distribution = getDistribution(servers, keys, virtualNodeCount)

  return (
    <PageLayout
      title="가상 노드"
      visualization={
        <HashRing
          servers={servers}
          keys={keys}
          virtualNodeCount={virtualNodeCount}
          selectedKeyId={selectedKeyId}
          onKeyClick={handleKeyClick}
          lookupArrow={lookupArrow}
        />
      }
      controls={
        <>
          <SectionLabel>서버당 가상 노드 수</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range"
              min={0}
              max={4}
              value={virtualNodeCount}
              onChange={(e) => {
                setVirtualNodeCount(Number(e.target.value))
                setSelectedKeyId(null)
                setLookupArrow(null)
              }}
              style={{ flex: 1, accentColor: '#60A5FA' }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: '#fff',
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {virtualNodeCount}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            총 노드 수: {servers.length * (1 + virtualNodeCount)}
          </div>
          <ActionButton onClick={addServer} disabled={servers.length >= 10}>
            서버 추가
          </ActionButton>
          <BulkKeyInput onAdd={addKeys} disabled={servers.length === 0} />
          {keys.length > 0 && servers.length > 0 && (
            <>
              <SectionLabel>키 분배</SectionLabel>
              <DistributionChart
                distribution={distribution}
                total={keys.length}
              />
            </>
          )}
          {selectedKeyId && lookupArrow && (
            <>
              <SectionLabel>조회 결과</SectionLabel>
              <div
                style={{
                  background: '#111122',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.8,
                }}
              >
                <div style={{ color: '#ccc' }}>
                  키: <span style={{ color: '#fff' }}>{selectedKeyId}</span>
                </div>
                <div style={{ color: '#ccc' }}>
                  서버:{' '}
                  <span style={{ color: lookupArrow.color }}>
                    {servers.find(
                      (s) =>
                        s.id ===
                        getKeyAssignment(
                          keys.find((k) => k.id === selectedKeyId)!,
                          servers,
                          virtualNodeCount,
                        ),
                    )?.name}
                  </span>
                </div>
              </div>
            </>
          )}
          <SectionLabel>서버</SectionLabel>
          <ServerList servers={servers} />
        </>
      }
    />
  )
}

function getDistribution(
  servers: import('../store').Server[],
  keys: import('../store').Key[],
  virtualNodeCount: number,
) {
  const counts = new Map<string, number>()
  for (const s of servers) counts.set(s.id, 0)
  for (const k of keys) {
    const sid = getKeyAssignment(k, servers, virtualNodeCount)
    if (sid) counts.set(sid, (counts.get(sid) ?? 0) + 1)
  }
  return servers.map((s) => ({
    serverId: s.id,
    name: s.name,
    color: s.color,
    count: counts.get(s.id) ?? 0,
  }))
}

function DistributionChart({
  distribution,
  total,
}: {
  distribution: { serverId: string; name: string; color: string; count: number }[]
  total: number
}) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {distribution.map((d) => {
        const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0'
        return (
          <div key={d.serverId}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 3,
              }}
            >
              <span style={{ color: d.color }}>{d.name}</span>
              <span style={{ color: '#999' }}>
                {d.count}개 ({pct}%)
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: '#333',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  background: d.color,
                  borderRadius: 3,
                  transformOrigin: 'left',
                  transform: `scaleX(${d.count / maxCount})`,
                  transition: 'transform 0.4s ease-out',
                }}
              />
            </div>
          </div>
        )
      })}
      {total > 0 && (
        <div
          style={{
            fontSize: 11,
            color: '#666',
            marginTop: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          표준편차:{' '}
          {(() => {
            const mean = total / distribution.length
            const variance =
              distribution.reduce(
                (sum, d) => sum + (d.count - mean) ** 2,
                0,
              ) / distribution.length
            return Math.sqrt(variance).toFixed(1)
          })()}
        </div>
      )}
    </div>
  )
}
