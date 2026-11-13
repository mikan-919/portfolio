export type CoverKind = 'works' | 'articles'

const PAPER = '#f4f4f3'
const INK = '#1e1e1c'
const GRAY = '#c9c9c5'
const FAINT = '#e4e4e1'
const ACCENT = '#b05224'
const W = 1280
const H = 720

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

const r = (value: number): number => Math.round(value * 10) / 10
const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index)
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1): string =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="${width}"/>`
const text = (x: number, y: number, body: string, size: number, fill: string, anchor = 'start'): string =>
  `<text x="${r(x)}" y="${r(y)}" font-family="UDEV Gothic HSLG" font-size="${size}" letter-spacing="${r(size * 0.14)}" fill="${fill}" text-anchor="${anchor}">${body}</text>`

// 方眼・トンボ・目盛り・ラベル。全バリアント共通の枠
const frame = (kind: string, code: string, random: () => number): string => {
  const grid = [
    ...range(W / 40 + 1).map(i => line(i * 40, 0, i * 40, H, FAINT)),
    ...range(H / 40 + 1).map(i => line(0, i * 40, W, i * 40, FAINT)),
  ]
  const crop = [
    [64, 64, 1, 1],
    [W - 64, 64, -1, 1],
    [64, H - 64, 1, -1],
    [W - 64, H - 64, -1, -1],
  ].flatMap(([x, y, dx, dy]) => [line(x, y, x + 28 * dx, y, INK, 1.5), line(x, y, x, y + 28 * dy, INK, 1.5)])
  const ticks = range(49).map(i => line(160 + i * 20, H - 64, 160 + i * 20, H - 64 - (i % 4 === 0 ? 14 : 6), INK))
  const coord = `${(random() * 90).toFixed(3)}N / ${(random() * 180).toFixed(3)}E`
  return [
    ...grid,
    ...crop,
    line(160, H - 64, 1120, H - 64, INK),
    ...ticks,
    text(104, 88, `${kind.toUpperCase()} // ${code}`, 15, INK),
    text(W - 104, 88, 'MIKAN-919', 15, INK, 'end'),
    text(W - 104, H - 84, coord, 13, INK, 'end'),
  ].join('')
}

// 等高線: 中心のまわりに歪んだ輪を重ねる
const contour = (random: () => number): string => {
  const cx = 520 + random() * 240
  const cy = 300 + random() * 120
  const phases = range(3).map(() => random() * Math.PI * 2)
  const ring = (radius: number, k: number): string => {
    const points = range(121).map(step => {
      const t = (step / 120) * Math.PI * 2
      const wobble =
        Math.sin(t * 2 + phases[0] + k * 0.15) * 0.12 +
        Math.sin(t * 3 + phases[1]) * 0.07 +
        Math.sin(t * 5 + phases[2] - k * 0.2) * 0.03
      const radiusAt = radius * (1 + wobble)
      return `${r(cx + Math.cos(t) * radiusAt * 1.35)} ${r(cy + Math.sin(t) * radiusAt)}`
    })
    return `<path d="M ${points.join(' L ')} Z" fill="none" stroke="${k % 5 === 0 ? INK : GRAY}" stroke-width="${k % 5 === 0 ? 2 : 1.2}"/>`
  }
  const rings = range(13).map(k => ring(56 + k * 20, k))
  const peak = random() * Math.PI * 2
  return [
    ...rings,
    `<circle cx="${r(cx + Math.cos(peak) * 120)}" cy="${r(cy + Math.sin(peak) * 90)}" r="11" fill="${ACCENT}"/>`,
    line(cx - 40, cy, cx + 40, cy, INK, 1.5),
    line(cx, cy - 40, cx, cy + 40, INK, 1.5),
  ].join('')
}

// 計器: 目盛り付きの円盤と扇形
const dial = (random: () => number): string => {
  const cx = 560 + random() * 160
  const cy = 360
  const radius = 230
  const start = random() * 360
  const sweep = 50 + random() * 70
  const polar = (deg: number, rad: number): [number, number] => [
    cx + Math.cos((deg * Math.PI) / 180) * rad,
    cy + Math.sin((deg * Math.PI) / 180) * rad,
  ]
  const ticks = range(120).map(i => {
    const [x1, y1] = polar(i * 3, radius)
    const [x2, y2] = polar(i * 3, radius - (i % 10 === 0 ? 26 : i % 5 === 0 ? 16 : 8))
    return line(x1, y1, x2, y2, INK, i % 10 === 0 ? 2 : 1)
  })
  const [sx, sy] = polar(start, radius - 34)
  const [ex, ey] = polar(start + sweep, radius - 34)
  const [nx, ny] = polar(start + sweep, radius + 18)
  return [
    `<path d="M ${r(cx)} ${r(cy)} L ${r(sx)} ${r(sy)} A ${radius - 34} ${radius - 34} 0 0 1 ${r(ex)} ${r(ey)} Z" fill="${GRAY}" fill-opacity="0.55"/>`,
    `<circle cx="${r(cx)}" cy="${r(cy)}" r="${radius}" fill="none" stroke="${INK}" stroke-width="2"/>`,
    `<circle cx="${r(cx)}" cy="${r(cy)}" r="${radius + 40}" fill="none" stroke="${GRAY}" stroke-dasharray="2 8"/>`,
    `<circle cx="${r(cx)}" cy="${r(cy)}" r="${radius * 0.42}" fill="none" stroke="${GRAY}"/>`,
    ...ticks,
    line(cx - radius - 70, cy, cx + radius + 70, cy, GRAY),
    line(cx, cy - radius - 70, cx, cy + radius + 70, GRAY),
    line(cx, cy, ex, ey, INK, 2),
    `<circle cx="${r(cx)}" cy="${r(cy)}" r="5" fill="${INK}"/>`,
    `<circle cx="${r(nx)}" cy="${r(ny)}" r="10" fill="${ACCENT}"/>`,
    text(cx + radius + 56, cy - 12, `${Math.round(sweep)}°`, 22, INK),
  ].join('')
}

// 網点: 滑らかな場で大きさを変えたドットの格子
const halftone = (random: () => number): string => {
  const fx = 0.01 + random() * 0.01
  const p = random() * 10
  const focus = [300 + random() * 680, 200 + random() * 320]
  const step = 24
  const cols = range(Math.floor((W - 200) / step))
  const rows = range(Math.floor((H - 260) / step))
  const accent = [Math.floor(random() * cols.length), Math.floor(random() * rows.length)]
  const dots = rows.flatMap(j =>
    cols.map(i => {
      const x = 100 + i * step + step / 2
      const y = 130 + j * step + step / 2
      const distance = Math.hypot(x - focus[0], y - focus[1]) / 520
      const field = 1 - distance + Math.sin(x * fx + p) * Math.cos(y * fx - p) * 0.12
      const size = Math.max(1.2, Math.min(1, Math.max(0, field)) ** 1.4 * (step * 0.46))
      if (i === accent[0] && j === accent[1]) {
        return `<circle cx="${r(x)}" cy="${r(y)}" r="${r(step * 0.42)}" fill="${ACCENT}"/>`
      }
      return `<circle cx="${r(x)}" cy="${r(y)}" r="${r(size)}" fill="${INK}"/>`
    }),
  )
  return dots.join('')
}

// ハザード: 斜線の帯、面取りしたブロック、輪郭だけの巨大数字
const hazard = (random: () => number, seedHash: number): string => {
  const top = 200 + random() * 120
  const height = 96
  const stripes = range(Math.ceil((W + height) / 32)).map(i =>
    line(i * 32 - height, top + height, i * 32, top, INK, 10),
  )
  const bx = 420 + random() * 200
  const by = top + height + 36
  const cut = 36
  const number = String(seedHash % 1000).padStart(3, '0')
  return [
    `<text x="${r(bx - 40)}" y="${r(top - 20)}" font-family="UDEV Gothic HSLG" font-size="220" fill="none" stroke="${GRAY}" stroke-width="2">${number}</text>`,
    `<clipPath id="band"><rect x="0" y="${r(top)}" width="${W}" height="${height}"/></clipPath>`,
    `<g clip-path="url(#band)">${stripes.join('')}</g>`,
    `<path d="M ${r(bx)} ${r(by)} H ${r(bx + 420)} V ${r(by + 140 - cut)} L ${r(bx + 420 - cut)} ${r(by + 140)} H ${r(bx)} Z" fill="${INK}"/>`,
    `<rect x="${r(bx + 24)}" y="${r(by + 24)}" width="14" height="14" fill="${ACCENT}"/>`,
    text(bx + 52, by + 37, 'CAUTION / 注意', 15, PAPER),
    ...range(4).map(i => line(bx + 24, by + 70 + i * 14, bx + 24 + (300 - i * 60), by + 70 + i * 14, '#6b6b67', 4)),
  ].join('')
}

export const coverUrl = (kind: CoverKind, id: string): string => `/covers/${kind}/${id}.png`

export const renderCoverSvg = (seed: string): string => {
  const seedHash = hashString(seed)
  const random = createRandom(seedHash)
  const [kind = 'cover'] = seed.split('/')
  const code = `0x${seedHash.toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`
  const variants = [contour, dial, halftone, (rand: () => number) => hazard(rand, seedHash)]
  const body = variants[seedHash % variants.length](random)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${frame(kind, code, random)}${body}</svg>`
}
