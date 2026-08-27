import { motion } from 'motion/react'

const PAGES = ['해시 공간', '키 배치와 조회', '가상 노드']

export default function PageIndicator({
  current,
  onSelect,
}: {
  current: number
  onSelect: (i: number) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {PAGES.map((label, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            background: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
          }}
          aria-label={`${label} 페이지`}
        >
          <motion.div
            animate={{
              width: i === current ? 24 : 8,
              backgroundColor: i === current ? '#fff' : '#666',
            }}
            style={{ height: 8, borderRadius: 4 }}
            transition={{ duration: 0.3 }}
          />
          <span
            style={{
              fontSize: 10,
              color: i === current ? '#fff' : '#666',
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
