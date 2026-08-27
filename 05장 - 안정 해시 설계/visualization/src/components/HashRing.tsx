import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { animate } from 'motion'
import { angleToPosition } from '../hash'
import {
  Server,
  Key,
  getAllNodes,
  getKeyAssignment,
  getServerColor,
  getArcs,
} from '../store'

const CX = 300
const CY = 300
const R = 220
const SERVER_R = 14
const KEY_R = 5
const LABEL_OFFSET = 28

function describeArc(
  startAngle: number,
  endAngle: number,
  r: number,
): string {
  let sweep = endAngle - startAngle
  if (sweep <= 0) sweep += 360
  const largeArc = sweep > 180 ? 1 : 0
  const start = angleToPosition(startAngle, CX, CY, r)
  const end = angleToPosition(endAngle, CX, CY, r)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

interface Props {
  servers: Server[]
  keys?: Key[]
  virtualNodeCount?: number
  showArcs?: boolean
  selectedKeyId?: string | null
  onKeyClick?: (keyId: string) => void
  lookupArrow?: { fromAngle: number; toAngle: number; color: string } | null
  dimKeys?: Set<string>
  highlightKeys?: Set<string>
}

export default function HashRing({
  servers,
  keys = [],
  virtualNodeCount = 0,
  showArcs = true,
  selectedKeyId,
  onKeyClick,
  lookupArrow,
  dimKeys,
  highlightKeys,
}: Props) {
  const arcs = showArcs ? getArcs(servers, virtualNodeCount) : []
  const allNodes = getAllNodes(servers, virtualNodeCount)

  return (
    <svg viewBox="0 0 600 600" style={{ maxWidth: '100%', maxHeight: '100%' }}>
      {arcs.map((arc, i) => (
        <path
          key={`arc-${i}-${arc.serverId}-${arc.endAngle.toFixed(0)}`}
          d={describeArc(arc.startAngle, arc.endAngle, R)}
          fill="none"
          stroke={arc.color}
          strokeWidth={28}
          strokeOpacity={0.15}
        />
      ))}

      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="#444"
        strokeWidth={2}
      />

      <AnimatePresence initial={false}>
        {allNodes.map((node) => {
          const pos = angleToPosition(node.angle, CX, CY, R)
          const outerPos = angleToPosition(node.angle, CX, CY, R + 80)
          const server = servers.find((s) => s.id === node.serverId)!
          const labelPos = angleToPosition(
            node.angle,
            CX,
            CY,
            R + LABEL_OFFSET,
          )
          return (
            <motion.g
              key={`${node.serverId}-${node.isVirtual ? 'v' + node.angle.toFixed(0) : 'main'}`}
              initial={{
                x: outerPos.x - pos.x,
                y: outerPos.y - pos.y,
                opacity: 0,
              }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{
                x: outerPos.x - pos.x,
                y: outerPos.y - pos.y,
                opacity: 0,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={SERVER_R}
                fill={server.color + '33'}
                stroke={server.color}
                strokeWidth={2}
                strokeDasharray={node.isVirtual ? '4 3' : 'none'}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={server.color}
                fontSize={node.isVirtual ? 10 : 13}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={500}
                opacity={node.isVirtual ? 0.7 : 1}
              >
                {node.isVirtual ? `${server.name}'` : server.name}
              </text>
            </motion.g>
          )
        })}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {keys.map((key) => {
          const assignedId = getKeyAssignment(key, servers, virtualNodeCount)
          const color = getServerColor(servers, assignedId)
          const pos = angleToPosition(key.angle, CX, CY, R)
          const outerPos = angleToPosition(key.angle, CX, CY, R + 80)
          const isDim = dimKeys?.has(key.id)
          const isHighlight = highlightKeys?.has(key.id)
          const isSelected = key.id === selectedKeyId
          return (
            <motion.g
              key={key.id}
              initial={{
                x: outerPos.x - pos.x,
                y: outerPos.y - pos.y,
                opacity: 0,
              }}
              animate={{
                x: 0,
                y: 0,
                opacity: isDim ? 0.3 : 1,
              }}
              exit={{
                x: outerPos.x - pos.x,
                y: outerPos.y - pos.y,
                opacity: 0,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                cursor: onKeyClick ? 'pointer' : 'default',
              }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={KEY_R + 8}
                fill="transparent"
                style={{ cursor: onKeyClick ? 'pointer' : 'default' }}
                onPointerDown={
                  onKeyClick
                    ? (e) => {
                        e.stopPropagation()
                        onKeyClick(key.id)
                      }
                    : undefined
                }
              />
              {(isSelected || isHighlight) && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={KEY_R + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.5}
                >
                  <animate
                    attributeName="r"
                    values={`${KEY_R + 3};${KEY_R + 6};${KEY_R + 3}`}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.2;0.5"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={KEY_R}
                animate={{ fill: color }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={pos.x}
                y={pos.y - KEY_R - 6}
                textAnchor="middle"
                fill="#aaa"
                fontSize={8}
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: 'none' }}
              >
                {key.name}
              </text>
            </motion.g>
          )
        })}
      </AnimatePresence>

      {lookupArrow && (
        <LookupArrowPath
          fromAngle={lookupArrow.fromAngle}
          toAngle={lookupArrow.toAngle}
          color={lookupArrow.color}
        />
      )}
    </svg>
  )
}

function LookupArrowPath({
  fromAngle,
  toAngle,
  color,
}: {
  fromAngle: number
  toAngle: number
  color: string
}) {
  const OFFSET = 55

  let sweep = toAngle - fromAngle
  if (sweep <= 0) sweep += 360

  const steps = 100
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = fromAngle + t * sweep
    const radius = R + OFFSET * Math.sin(t * Math.PI)
    points.push(angleToPosition(angle, CX, CY, radius))
  }

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  return <DrawingPath d={d} color={color} />
}

function DrawingPath({ d, color }: { d: string; color: string }) {
  const pathRef = useRef<SVGPathElement>(null)
  const arrowRef = useRef<SVGPolygonElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const arrow = arrowRef.current
    if (!path || !arrow) return
    const len = path.getTotalLength()
    path.setAttribute('stroke-dasharray', String(len))
    path.setAttribute('stroke-dashoffset', String(len))
    arrow.setAttribute('opacity', '0')
    const arrowLen = 9
    const drawLen = len - arrowLen
    const ctrl = animate(0, len, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        path.setAttribute('stroke-dashoffset', String(len - Math.min(v, drawLen)))
        const p1 = path.getPointAtLength(Math.max(0, v - 1))
        const p2 = path.getPointAtLength(v)
        const deg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
        arrow.setAttribute('transform', `translate(${p2.x},${p2.y}) rotate(${deg})`)
        arrow.setAttribute('opacity', v > 2 ? '1' : '0')
      },
    })
    return () => ctrl.stop()
  }, [d])

  return (
    <>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon
        ref={arrowRef}
        points="-9,-5 0,0 -9,5"
        fill={color}
        opacity={0}
      />
    </>
  )
}
