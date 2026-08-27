import { useState, useRef, useEffect } from 'react'
import { useStore, getKeyAssignment, getServerColor } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, {
  ActionButton,
  SectionLabel,
  ServerList,
  ScrollList,
} from '../components/PageLayout'

export default function P5ServerChange() {
  const servers = useStore((s) => s.servers)
  const keys = useStore((s) => s.keys)
  const addServer = useStore((s) => s.addServer)
  const removeServer = useStore((s) => s.removeServer)
  const [highlightKeys, setHighlightKeys] = useState<Set<string>>(new Set())
  const [dimKeys, setDimKeys] = useState<Set<string>>(new Set())
  const prevAssignments = useRef<Map<string, string | null>>(new Map())

  useEffect(() => {
    const currentAssignments = new Map<string, string | null>()
    for (const k of keys) {
      currentAssignments.set(k.id, getKeyAssignment(k, servers, 0))
    }

    const changed = new Set<string>()
    const unchanged = new Set<string>()
    for (const k of keys) {
      const prev = prevAssignments.current.get(k.id)
      const curr = currentAssignments.get(k.id)
      if (prev !== undefined && prev !== curr) {
        changed.add(k.id)
      } else {
        unchanged.add(k.id)
      }
    }

    if (changed.size > 0) {
      setHighlightKeys(changed)
      setDimKeys(unchanged)
      const timer = setTimeout(() => {
        setHighlightKeys(new Set())
        setDimKeys(new Set())
      }, 2000)
      prevAssignments.current = currentAssignments
      return () => clearTimeout(timer)
    }

    prevAssignments.current = currentAssignments
  }, [servers, keys])

  return (
    <PageLayout
      title="서버 변동"
      visualization={
        <HashRing
          servers={servers}
          keys={keys}
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
          {highlightKeys.size > 0 && (
            <>
              <SectionLabel>재배치 {highlightKeys.size}개</SectionLabel>
              <ScrollList>
                <div
                  style={{
                    background: '#111122',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {keys
                    .filter((k) => highlightKeys.has(k.id))
                    .map((k) => {
                      const sid = getKeyAssignment(k, servers, 0)
                      const color = getServerColor(servers, sid)
                      return (
                        <div
                          key={k.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '2px 0',
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
                            {k.name} → {sid}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </ScrollList>
            </>
          )}
          <SectionLabel>서버</SectionLabel>
          <ServerList servers={servers} onRemove={removeServer} />
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            전체 키 {keys.length}개
            {highlightKeys.size > 0 && ` / 재배치 ${highlightKeys.size}개`}
          </div>
        </>
      }
    />
  )
}
