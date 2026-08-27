import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore, getKeyAssignment, getServerColor } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, {
  ActionButton,
  BulkKeyInput,
  SectionLabel,
  ServerList,
  ScrollList,
} from '../components/PageLayout'

export default function P3Operations() {
  const servers = useStore((s) => s.servers)
  const keys = useStore((s) => s.keys)
  const addServer = useStore((s) => s.addServer)
  const removeServer = useStore((s) => s.removeServer)
  const addKeys = useStore((s) => s.addKeys)

  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [lookupArrow, setLookupArrow] = useState<{
    fromAngle: number
    toAngle: number
    color: string
  } | null>(null)

  const [highlightKeys, setHighlightKeys] = useState<Set<string>>(new Set())
  const [dimKeys, setDimKeys] = useState<Set<string>>(new Set())
  const [reassigned, setReassigned] = useState<
    { id: string; name: string; serverId: string | null }[]
  >([])
  const prevAssignments = useRef<Map<string, string | null>>(new Map())

  useEffect(() => {
    const currentAssignments = new Map<string, string | null>()
    for (const k of keys) {
      currentAssignments.set(k.id, getKeyAssignment(k, servers, 0))
    }

    const changed = new Set<string>()
    const unchanged = new Set<string>()
    const reassignedList: typeof reassigned = []
    for (const k of keys) {
      const prev = prevAssignments.current.get(k.id)
      const curr = currentAssignments.get(k.id)
      if (prev !== undefined && prev !== curr) {
        changed.add(k.id)
        reassignedList.push({ id: k.id, name: k.name, serverId: curr ?? null })
      } else {
        unchanged.add(k.id)
      }
    }

    if (changed.size > 0) {
      setSelectedKeyId(null)
      setLookupArrow(null)
      setHighlightKeys(changed)
      setDimKeys(unchanged)
      setReassigned(reassignedList)
      const timer = setTimeout(() => {
        setHighlightKeys(new Set())
        setDimKeys(new Set())
        setReassigned([])
      }, 2500)
      prevAssignments.current = currentAssignments
      return () => clearTimeout(timer)
    }

    prevAssignments.current = currentAssignments
  }, [servers, keys])

  const handleKeyClick = useCallback(
    (keyId: string) => {
      const key = keys.find((k) => k.id === keyId)
      if (!key) return
      const serverId = getKeyAssignment(key, servers, 0)
      if (!serverId) return
      const server = servers.find((s) => s.id === serverId)
      if (!server) return
      setSelectedKeyId(keyId)
      setLookupArrow({
        fromAngle: key.angle,
        toAngle: server.angle,
        color: server.color,
      })
    },
    [keys, servers],
  )

  return (
    <PageLayout
      title="키 배치와 조회"
      visualization={
        <HashRing
          servers={servers}
          keys={keys}
          selectedKeyId={selectedKeyId}
          onKeyClick={handleKeyClick}
          lookupArrow={lookupArrow}
          highlightKeys={highlightKeys}
          dimKeys={dimKeys}
        />
      }
      controls={
        <>
          <ActionButton
            onClick={addServer}
            disabled={servers.length >= 10}
          >
            서버 추가
          </ActionButton>
          {servers.length > 0 && (
            <>
              <SectionLabel>서버 {servers.length}개</SectionLabel>
              <ServerList servers={servers} onRemove={removeServer} />
            </>
          )}

          <div style={{ borderTop: '1px solid #1a1a3a', margin: '4px 0' }} />

          <BulkKeyInput onAdd={addKeys} disabled={servers.length === 0} />

          {keys.length > 0 && (
            <>
              <SectionLabel>키 {keys.length}개</SectionLabel>
              <ScrollList>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {keys.map((k) => {
                    const sid = getKeyAssignment(k, servers, 0)
                    const color = getServerColor(servers, sid)
                    return (
                      <div
                        key={k.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono', monospace",
                          opacity: dimKeys.has(k.id) ? 0.3 : 1,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: '#ccc' }}>{k.name}</span>
                        <span style={{ color: '#555' }}>→ {sid}</span>
                      </div>
                    )
                  })}
                </div>
              </ScrollList>
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
                          0,
                        ),
                    )?.name}
                  </span>
                </div>
              </div>
            </>
          )}

          {reassigned.length > 0 && (
            <>
              <SectionLabel>재배치 {reassigned.length}개</SectionLabel>
              <ScrollList>
                <div
                  style={{
                    background: '#111122',
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {reassigned.map((r) => {
                    const color = getServerColor(servers, r.serverId)
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: color,
                          }}
                        />
                        <span style={{ color: '#ccc' }}>
                          {r.name} → {r.serverId}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </ScrollList>
            </>
          )}

          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
            키를 클릭하면 담당 서버를 조회합니다
          </div>
        </>
      }
    />
  )
}
