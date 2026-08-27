import { useStore } from '../store'
import HashRing from '../components/HashRing'
import PageLayout, {
  ActionButton,
  SectionLabel,
  ServerList,
} from '../components/PageLayout'

export default function P2ServerPlacement() {
  const servers = useStore((s) => s.servers)
  const addServer = useStore((s) => s.addServer)
  const removeServer = useStore((s) => s.removeServer)

  return (
    <PageLayout
      title="서버 배치"
      visualization={<HashRing servers={servers} />}
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
              <SectionLabel>서버 목록</SectionLabel>
              <ServerList servers={servers} onRemove={removeServer} />
            </>
          )}
        </>
      }
    />
  )
}
