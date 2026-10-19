export type CoverKind = 'works' | 'articles'

const PAPER = '#f4f4f3'
const INK = '#1e1e1c'
const GRAY = '#d9d9d6'
const ACCENT = '#b05224'

const hashString = (value: string): number => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRandom = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const round = (value: number): number => Math.round(value * 10) / 10

const quarterCircle = (x: number, y: number, radius: number, rotation: number, fill: string): string =>
  `<path d="M 0 0 H ${round(radius)} A ${round(radius)} ${round(radius)} 0 0 1 0 ${round(radius)} Z" fill="${fill}" transform="translate(${round(x)} ${round(y)}) rotate(${rotation})"/>`

const quarterTurns = [0, 90, 180, 270]

export const coverUrl = (kind: CoverKind, id: string): string => `/covers/${kind}/${id}.png`

export const renderCoverSvg = (seed: string): string => {
  const seedHash = hashString(seed)
  const random = createRandom(seedHash)
  const variant = seedHash % 3
  const shapes: string[] = []

  if (variant === 0) {
    const baseline = 600 + random() * 60
    shapes.push(
      quarterCircle(
        180 + random() * 520,
        240 + random() * 260,
        200 + random() * 120,
        quarterTurns[Math.floor(random() * 4)],
        INK,
      ),
    )
    shapes.push(
      quarterCircle(
        700 + random() * 340,
        140 + random() * 140,
        110 + random() * 90,
        quarterTurns[Math.floor(random() * 4)],
        GRAY,
      ),
    )
    shapes.push(
      `<circle cx="${round(320 + random() * 640)}" cy="${round(220 + random() * 320)}" r="${round(18 + random() * 16)}" fill="${ACCENT}"/>`,
    )
    shapes.push(
      `<line x1="120" y1="${round(baseline)}" x2="1160" y2="${round(baseline)}" stroke="${INK}" stroke-width="2"/>`,
    )
  } else if (variant === 1) {
    const cx = 400 + random() * 480
    const cy = 280 + random() * 160
    const radius = 160 + random() * 60
    const angle = random() * Math.PI * 2
    const rule = 120 + random() * 80
    shapes.push(
      `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius)}" fill="none" stroke="${INK}" stroke-width="3"/>`,
    )
    shapes.push(
      `<circle cx="${round(cx + Math.cos(angle) * radius)}" cy="${round(cy + Math.sin(angle) * radius)}" r="12" fill="${INK}"/>`,
    )
    shapes.push(
      `<circle cx="${round(cx + Math.cos(angle + 1.9) * radius)}" cy="${round(cy + Math.sin(angle + 1.9) * radius)}" r="${round(16 + random() * 14)}" fill="${ACCENT}"/>`,
    )
    shapes.push(`<line x1="${round(rule)}" y1="0" x2="${round(rule)}" y2="720" stroke="${GRAY}" stroke-width="2"/>`)
  } else {
    const top = 150 + random() * 120
    const height = 120 + random() * 90
    const bottom = top + height
    const spacing = 28
    const stripes: string[] = []
    for (let x = -height; x <= 1280 + height; x += spacing) {
      stripes.push(
        `<line x1="${round(x)}" y1="${round(top)}" x2="${round(x - height)}" y2="${round(bottom)}" stroke="${INK}" stroke-width="2"/>`,
      )
    }
    const dot = 560 + random() * 60
    shapes.push(`<clipPath id="band"><rect x="0" y="${round(top)}" width="1280" height="${round(height)}"/></clipPath>`)
    shapes.push(`<g clip-path="url(#band)">${stripes.join('')}</g>`)
    shapes.push(
      `<circle cx="${round(220 + random() * 840)}" cy="${round(dot)}" r="${round(36 + random() * 24)}" fill="${ACCENT}"/>`,
    )
    shapes.push(`<line x1="120" y1="0" x2="120" y2="720" stroke="${GRAY}" stroke-width="2"/>`)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><rect width="1280" height="720" fill="${PAPER}"/>${shapes.join('')}</svg>`
}
