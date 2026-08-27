import { useState, useEffect, useRef } from 'react'
import { animate } from 'motion'
import PageLayout, { ActionButton } from '../components/PageLayout'

const VB_W = 900
const CX = VB_W / 2
const CY = 300
const R = 220
const N = 150
const TABLE_Y = CY
const CELLS = 20
const CELL_W = 40
const TABLE_H = 44
const TABLE_W = CELLS * CELL_W
const TABLE_LEFT = CX - TABLE_W / 2
const TABLE_RIGHT = CX + TABLE_W / 2

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function generatePath(t: number): string {
  const cmds: string[] = []
  for (let i = 0; i < N; i++) {
    const frac = i / (N - 1)
    const hx = TABLE_LEFT + frac * (TABLE_RIGHT - TABLE_LEFT)
    const hy = TABLE_Y

    let angleDeg: number
    if (frac <= 0.5) {
      angleDeg = 360 - frac * 360
    } else {
      angleDeg = 180 - (frac - 0.5) * 360
    }
    const rad = ((angleDeg - 90) * Math.PI) / 180
    const cx = CX + R * Math.cos(rad)
    const cy = CY + R * Math.sin(rad)

    const x = lerp(hx, cx, t)
    const y = lerp(hy, cy, t)
    cmds.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  if (t > 0.95) cmds.push('Z')
  return cmds.join(' ')
}

function cellLabel(i: number): string {
  if (i <= 4) return String(i)
  const fromEnd = CELLS - 1 - i
  return `2³²−${fromEnd + 1}`
}

const LABEL_INDICES = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19]

export default function P1HashSpace() {
  const [isRing, setIsRing] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const tableRef = useRef<SVGGElement>(null)
  const joinRef = useRef<SVGGElement>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const prevIsRing = useRef(isRing)

  useEffect(() => {
    if (prevIsRing.current === isRing) return
    prevIsRing.current = isRing
    animRef.current?.stop()
    const from = isRing ? 0 : 1
    const to = isRing ? 1 : 0
    animRef.current = animate(from, to, {
      duration: 1.2,
      ease: [0, 0, 0.2, 1],
      onUpdate(t) {
        if (pathRef.current) {
          pathRef.current.setAttribute('d', generatePath(t))
        }
        if (tableRef.current) {
          tableRef.current.style.opacity = String(t < 0.15 ? lerp(1, 0, t / 0.15) : 0)
        }
        if (joinRef.current) {
          joinRef.current.style.opacity = String(t > 0.85 ? lerp(0, 1, (t - 0.85) / 0.15) : 0)
        }
      },
    })
    return () => animRef.current?.stop()
  }, [isRing])

  return (
    <PageLayout
      title="해시 공간 → 해시 링"
      visualization={
        <svg viewBox={`0 0 ${VB_W} 600`} style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <g ref={tableRef}>
            <rect
              x={TABLE_LEFT}
              y={TABLE_Y - TABLE_H / 2}
              width={TABLE_RIGHT - TABLE_LEFT}
              height={TABLE_H}
              fill="none"
              stroke="#444"
              strokeWidth={1.5}
              rx={2}
            />
            {Array.from({ length: CELLS - 1 }, (_, i) => {
              const x = TABLE_LEFT + (i + 1) * CELL_W
              return (
                <line
                  key={i}
                  x1={x}
                  y1={TABLE_Y - TABLE_H / 2}
                  x2={x}
                  y2={TABLE_Y + TABLE_H / 2}
                  stroke="#333"
                  strokeWidth={1}
                />
              )
            })}
            {LABEL_INDICES.map((i) => (
              <text
                key={i}
                x={TABLE_LEFT + (i + 0.5) * CELL_W}
                y={TABLE_Y + TABLE_H / 2 + 16}
                textAnchor="middle"
                fill="#888"
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
              >
                {cellLabel(i)}
              </text>
            ))}
            <text
              x={CX}
              y={TABLE_Y + TABLE_H / 2 + 16}
              textAnchor="middle"
              fill="#555"
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
            >
              ···
            </text>
          </g>

          <path
            ref={pathRef}
            d={generatePath(0)}
            fill="none"
            stroke="#aaa"
            strokeWidth={2.5}
          />

          <g ref={joinRef} style={{ opacity: isRing ? 1 : 0 }}>
            <line
              x1={CX}
              y1={CY - R - 18}
              x2={CX}
              y2={CY - R + 18}
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <text
              x={CX - 10}
              y={CY - R - 28}
              textAnchor="end"
              fill="#999"
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
            >
              0
            </text>
            <text
              x={CX + 10}
              y={CY - R - 28}
              textAnchor="start"
              fill="#999"
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
            >
              2³²−1
            </text>
          </g>
        </svg>
      }
      controls={
        <ActionButton onClick={() => setIsRing(!isRing)}>
          {isRing ? '펼치기' : '링으로 접기'}
        </ActionButton>
      }
    />
  )
}
