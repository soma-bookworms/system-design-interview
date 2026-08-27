import { ReactNode, useState } from 'react'

export default function PageLayout({
  title,
  visualization,
  controls,
}: {
  title: string
  visualization: ReactNode
  controls: ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gridTemplateRows: '1fr',
        height: '100%',
        gap: 0,
      }}
    >
      <div style={{ position: 'relative', minHeight: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 32,
            fontSize: 20,
            fontWeight: 600,
            color: '#fff',
            opacity: 0.7,
            zIndex: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {visualization}
        </div>
      </div>
      <div
        style={{
          background: '#080820',
          borderLeft: '1px solid #1a1a3a',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
      >
        {controls}
      </div>
    </div>
  )
}

export function ActionButton({
  onClick,
  children,
  color = '#60A5FA',
  disabled = false,
}: {
  onClick: () => void
  children: ReactNode
  color?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#333' : color + '22',
        color: disabled ? '#666' : color,
        border: `1px solid ${disabled ? '#444' : color + '55'}`,
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 500,
        transition: 'background 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background =
            color + '33'
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background =
            color + '22'
      }}
    >
      {children}
    </button>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginTop: 8,
      }}
    >
      {children}
    </div>
  )
}

export function ServerList({
  servers,
  onRemove,
}: {
  servers: { id: string; name: string; color: string }[]
  onRemove?: (id: string) => void
}) {
  if (servers.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {servers.map((s) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: s.color,
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1 }}>{s.name}</span>
          {onRemove && (
            <button
              onClick={() => onRemove(s.id)}
              style={{
                background: 'none',
                color: '#666',
                fontSize: 14,
                padding: '0 4px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#666'
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export function BulkKeyInput({
  onAdd,
  disabled = false,
}: {
  onAdd: (count: number) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState('10')
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input
        type="number"
        min={1}
        max={200}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: 60,
          background: '#111122',
          border: '1px solid #2a2a4a',
          borderRadius: 6,
          color: '#fff',
          padding: '6px 8px',
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: 'center',
        }}
      />
      <button
        onClick={() => {
          const n = Math.min(200, Math.max(1, parseInt(value) || 1))
          onAdd(n)
        }}
        disabled={disabled}
        style={{
          flex: 1,
          background: disabled ? '#333' : '#60A5FA22',
          color: disabled ? '#666' : '#60A5FA',
          border: `1px solid ${disabled ? '#444' : '#60A5FA55'}`,
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        키 추가
      </button>
    </div>
  )
}

export function ScrollList({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxHeight: 180,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
