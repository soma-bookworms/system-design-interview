import { useStore } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, {
  BulkKeyInput,
  SectionLabel,
  ServerList,
  ScrollList,
} from '../components/PageLayout'
import { getKeyAssignment, getServerColor } from '../store'

export default function P3KeyPlacement() {
  const servers = useStore((s) => s.servers)
  const keys = useStore((s) => s.keys)
  const addKeys = useStore((s) => s.addKeys)

  return (
    <PageLayout
      title="키 배치"
      visualization={<HashRing servers={servers} keys={keys} />}
      controls={
        <>
          <BulkKeyInput
            onAdd={addKeys}
            disabled={servers.length === 0}
          />
          {servers.length === 0 && (
            <div style={{ fontSize: 12, color: '#EF4444' }}>
              서버를 먼저 배치하세요
            </div>
          )}
          {keys.length > 0 && (
            <>
              <SectionLabel>키 {keys.length}개</SectionLabel>
              <ScrollList>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: '#ccc' }}>{k.name}</span>
                        <span style={{ color: '#666' }}>→ {sid}</span>
                      </div>
                    )
                  })}
                </div>
              </ScrollList>
            </>
          )}
          {servers.length > 0 && (
            <>
              <SectionLabel>서버</SectionLabel>
              <ServerList servers={servers} />
            </>
          )}
        </>
      }
    />
  )
}
