import { useState, useCallback } from 'react'
import { useStore, getKeyAssignment } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, { SectionLabel, ServerList } from '../components/PageLayout'

export default function P4KeyLookup() {
  const servers = useStore((s) => s.servers)
  const keys = useStore((s) => s.keys)
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
      title="키 조회"
      visualization={
        <HashRing
          servers={servers}
          keys={keys}
          selectedKeyId={selectedKeyId}
          onKeyClick={handleKeyClick}
          lookupArrow={lookupArrow}
        />
      }
      controls={
        <>
          {keys.length === 0 && (
            <div style={{ fontSize: 12, color: '#EF4444' }}>
              키를 먼저 배치하세요
            </div>
          )}
          {selectedKeyId && lookupArrow && (
            <>
              <SectionLabel>조회 결과</SectionLabel>
              <div
                style={{
                  background: '#111122',
                  borderRadius: 8,
                  padding: 12,
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
          <SectionLabel>서버</SectionLabel>
          <ServerList servers={servers} />
        </>
      }
    />
  )
}
