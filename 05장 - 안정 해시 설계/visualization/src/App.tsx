import { useEffect } from 'react'
import { useStore } from './store'
import PageIndicator from './components/PageIndicator'
import P1HashSpace from './pages/P1HashSpace'
import P3Operations from './pages/P3Operations'
import P6VirtualNodes from './pages/P6VirtualNodes'

const PAGES = [P1HashSpace, P3Operations, P6VirtualNodes]
const TOTAL = PAGES.length

export default function App() {
  const currentPage = useStore((s) => s.currentPage)
  const setPage = useStore((s) => s.setPage)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        setPage(Math.min(currentPage + 1, TOTAL - 1))
      } else if (e.key === 'ArrowLeft') {
        setPage(Math.max(currentPage - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, setPage])

  const Page = PAGES[currentPage]

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <Page />
        </div>
      </div>
      <div
        style={{
          padding: '12px 0 16px',
          borderTop: '1px solid #222',
          background: '#000011',
        }}
      >
        <PageIndicator current={currentPage} onSelect={setPage} />
      </div>
    </div>
  )
}
