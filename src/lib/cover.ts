export type CoverKind = 'works' | 'articles'

const PAPER = '#f4f4f3'
const INK = '#1e1e1c'
const GRAY = '#c9c9c5'
const FAINT = '#e6e6e3'
const ACCENT = '#b05224'
const W = 1280
const H = 720

type Palette = { fg: string; sub: string; bg: string }
type Motif = (random: () => number) => (palette: Palette) => string

const LIGHT: Palette = { fg: INK, sub: GRAY, bg: PAPER }
const DARK: Palette = { fg: PAPER, sub: '#5c5c58', bg: INK }

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
const escapeXml = (value: string): string => value.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1): string =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="${width}"/>`
const text = (x: number, y: number, body: string, size: number, fill: string, anchor = 'start'): string =>
  `<text x="${r(x)}" y="${r(y)}" font-family="UDEV Gothic HSLG" font-size="${size}" letter-spacing="${r(size * 0.14)}" fill="${fill}" text-anchor="${anchor}">${escapeXml(body)}</text>`
const polyline = (points: [number, number][]): string => points.map(([x, y]) => `${r(x)} ${r(y)}`).join(' L ')

// 稜線: 奥から手前へ重ねた尾根の断面。手前の面が奥の線を隠す
const ridges: Motif = random => {
  const center = 460 + random() * 360
  const peaks = range(3).map(() => ({
    x: center + (random() - 0.5) * 360,
    width: 60 + random() * 120,
    height: 50 + random() * 90,
  }))
  const phase = random() * 10
  const rows = range(34).map(k => {
    const base = 210 + k * 13
    const points = range(141).map((step): [number, number] => {
      const x = 60 + step * 8.3
      const envelope = peaks.reduce((sum, p) => sum + p.height * Math.exp(-(((x - p.x) / p.width) ** 2)), 0)
      const noise = Math.sin(x * 0.031 + phase + k * 0.7) * Math.sin(x * 0.013 - k * 0.3) * 0.5 + 0.5
      return [x, base - envelope * (0.35 + noise * 0.65) * Math.min(1, k / 6 + 0.3)]
    })
    return { k, points }
  })
  const marker = rows[20].points[Math.floor(random() * 60) + 40]
  return ({ fg, bg }) =>
    [
      ...rows.map(
        ({ k, points }) =>
          `<path d="M ${polyline(points)} L ${W} ${H} L 0 ${H} Z" fill="${bg}" stroke="none"/><path d="M ${polyline(points)}" fill="none" stroke="${fg}" stroke-width="${k % 6 === 0 ? 2 : 1}" stroke-linejoin="round"/>`,
      ),
      `<circle cx="${r(marker[0])}" cy="${r(marker[1] - 22)}" r="9" fill="${ACCENT}"/>`,
      line(marker[0], marker[1] - 12, marker[0], marker[1], fg, 1.5),
    ].join('')
}

// 流線: ベクトル場に沿って短い線を流す
const flow: Motif = random => {
  const f = 0.0035 + random() * 0.003
  const p = random() * 10
  const angle = (x: number, y: number): number =>
    (Math.sin(x * f + p) + Math.cos(y * f * 1.4 - p) + Math.sin((x - y) * f * 0.5)) * 1.3
  const trace = (x0: number, y0: number): [number, number][] =>
    range(36).reduce<[number, number][]>(
      points => {
        const [x, y] = points[points.length - 1]
        const a = angle(x, y)
        return [...points, [x + Math.cos(a) * 7, y + Math.sin(a) * 7]]
      },
      [[x0, y0]],
    )
  const seeds = range(26 * 15).map(i => [((i % 26) + random()) * 50 - 10, (Math.floor(i / 26) + random()) * 50 - 10])
  const strokes = seeds.map(([x, y]) => ({ points: trace(x, y), strong: random() < 0.12 }))
  const accent = strokes[Math.floor(strokes.length / 2)].points[18]
  return ({ fg, sub }) =>
    [
      ...strokes.map(
        ({ points, strong }) =>
          `<path d="M ${polyline(points)}" fill="none" stroke="${strong ? fg : sub}" stroke-width="${strong ? 1.8 : 1.1}" stroke-linecap="round"/>`,
      ),
      `<circle cx="${r(accent[0])}" cy="${r(accent[1])}" r="10" fill="${ACCENT}"/>`,
    ].join('')
}

// 等高線: 中心のまわりに歪んだ輪を重ね、高いほど濃く塗る
const contour: Motif = random => {
  const cx = 520 + random() * 240
  const cy = 300 + random() * 120
  const phases = range(3).map(() => random() * Math.PI * 2)
  const rings = range(15)
    .reverse()
    .map(k => {
      const radius = 40 + k * 24
      const points = range(121).map((step): [number, number] => {
        const t = (step / 120) * Math.PI * 2
        const wobble =
          Math.sin(t * 2 + phases[0] + k * 0.15) * 0.12 +
          Math.sin(t * 3 + phases[1]) * 0.07 +
          Math.sin(t * 5 + phases[2] - k * 0.2) * 0.03
        return [cx + Math.cos(t) * radius * (1 + wobble) * 1.4, cy + Math.sin(t) * radius * (1 + wobble)]
      })
      return { k, d: `M ${polyline(points)} Z` }
    })
  const peak = random() * Math.PI * 2
  return ({ fg, sub, bg }) =>
    [
      ...rings.map(
        ({ k, d }) =>
          `<path d="${d}" fill="${k < 3 ? sub : bg}" stroke="${k % 4 === 0 ? fg : sub}" stroke-width="${k % 4 === 0 ? 2 : 1.2}"/>`,
      ),
      `<circle cx="${r(cx + Math.cos(peak) * 150)}" cy="${r(cy + Math.sin(peak) * 100)}" r="10" fill="${ACCENT}"/>`,
      line(cx - 30, cy, cx + 30, cy, fg, 1.5),
      line(cx, cy - 30, cx, cy + 30, fg, 1.5),
    ].join('')
}

// 計器: 目盛り付きの円盤を2重に重ねる
const dial: Motif = random => {
  const cx = 560 + random() * 160
  const cy = 360
  const start = random() * 360
  const sweep = 50 + random() * 90
  const polar = (deg: number, rad: number): [number, number] => [
    cx + Math.cos((deg * Math.PI) / 180) * rad,
    cy + Math.sin((deg * Math.PI) / 180) * rad,
  ]
  return ({ fg, sub }) => {
    const ring = (radius: number, count: number, offset: number): string =>
      range(count)
        .map(i => {
          const deg = (i * 360) / count + offset
          const long = i % 10 === 0
          const [x1, y1] = polar(deg, radius)
          const [x2, y2] = polar(deg, radius - (long ? 24 : i % 5 === 0 ? 14 : 7))
          return line(x1, y1, x2, y2, fg, long ? 2 : 1)
        })
        .join('')
    const [sx, sy] = polar(start, 196)
    const [ex, ey] = polar(start + sweep, 196)
    const [nx, ny] = polar(start + sweep, 290)
    return [
      `<path d="M ${r(cx)} ${r(cy)} L ${r(sx)} ${r(sy)} A 196 196 0 0 1 ${r(ex)} ${r(ey)} Z" fill="${sub}" fill-opacity="0.6"/>`,
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="270" fill="none" stroke="${fg}" stroke-width="2"/>`,
      ring(270, 120, 0),
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="196" fill="none" stroke="${sub}"/>`,
      ring(196, 60, start),
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="80" fill="none" stroke="${sub}" stroke-dasharray="3 6"/>`,
      line(cx - 340, cy, cx + 340, cy, sub),
      line(cx, cy - 340, cx, cy + 340, sub),
      line(cx, cy, ex, ey, fg, 2),
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="6" fill="${fg}"/>`,
      `<circle cx="${r(nx)}" cy="${r(ny)}" r="10" fill="${ACCENT}"/>`,
      text(cx + 300, cy - 14, `${Math.round(sweep)}°`, 24, fg),
    ].join('')
  }
}

// 網点: 焦点から離れるほど小さくなるドットの格子
const halftone: Motif = random => {
  const p = random() * 10
  const focus = [380 + random() * 520, 240 + random() * 240]
  const step = 22
  const cols = range(Math.floor((W - 120) / step))
  const rows = range(Math.floor((H - 240) / step))
  const dots = rows.flatMap(j =>
    cols.map(i => {
      const x = 60 + i * step + step / 2
      const y = 120 + j * step + step / 2
      const distance = Math.hypot((x - focus[0]) * 0.8, y - focus[1]) / 420
      const field = 1 - distance + Math.sin(x * 0.02 + p) * Math.cos(y * 0.02 - p) * 0.15
      return [x, y, Math.max(1, Math.min(1, Math.max(0, field)) ** 1.3 * (step * 0.5))]
    }),
  )
  return ({ fg }) =>
    [
      ...dots.map(([x, y, size]) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(size)}" fill="${fg}"/>`),
      `<circle cx="${r(focus[0])}" cy="${r(focus[1])}" r="${step * 0.62}" fill="${ACCENT}"/>`,
    ].join('')
}

const motifs: [string, Motif][] = [
  ['RIDGE', ridges],
  ['FLOW', flow],
  ['CONTOUR', contour],
  ['DIAL', dial],
  ['HALFTONE', halftone],
]

export const coverUrl = (kind: CoverKind, id: string): string => `/covers/${kind}/${id}.png`

export const renderCoverSvg = (seed: string): string => {
  const seedHash = hashString(seed)
  const random = createRandom(seedHash)
  const [kind = 'cover', ...rest] = seed.split('/')
  const id = rest.join('/') || seed
  const code = `0x${seedHash.toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`
  const motifIndex = seedHash % motifs.length
  const [name, motif] = motifs[motifIndex]
  const draw = motif(random)

  // 図柄を白黒反転して見せる面取りの帯。縦長カードの切り出しに入るよう中央寄り
  const bandWidth = 220 + random() * 160
  const bandX = 380 + random() * (520 - bandWidth)
  const bandTop = 96
  const bandBottom = H - 120
  const cut = 40
  const band = `M ${r(bandX)} ${bandTop} H ${r(bandX + bandWidth)} V ${bandBottom - cut} L ${r(bandX + bandWidth - cut)} ${bandBottom} H ${r(bandX)} Z`

  const grid = [
    ...range(W / 40 + 1).map(i => line(i * 40, 0, i * 40, H, FAINT)),
    ...range(H / 40 + 1).map(i => line(0, i * 40, W, i * 40, FAINT)),
  ]
  const crop = [
    [56, 56, 1, 1],
    [W - 56, 56, -1, 1],
    [56, H - 56, 1, -1],
    [W - 56, H - 56, -1, -1],
  ].flatMap(([x, y, dx, dy]) => [line(x, y, x + 24 * dx, y, INK, 1.5), line(x, y, x, y + 24 * dy, INK, 1.5)])
  const ticks = range(49).map(i => line(160 + i * 20, H - 56, 160 + i * 20, H - 56 - (i % 4 === 0 ? 12 : 5), INK))
  const hazard = range(14).map(i => line(bandX + i * 14 - 20, bandBottom + 22, bandX + i * 14, bandBottom + 8, INK, 5))
  const giant = id.toUpperCase().replace(/-/g, '.')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    '<defs>',
    `<clipPath id="band"><path d="${band}"/></clipPath>`,
    `<clipPath id="hz"><rect x="${r(bandX)}" y="${bandBottom + 8}" width="${r(Math.min(bandWidth, 160))}" height="14"/></clipPath>`,
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seedHash % 997}"/><feColorMatrix type="saturate" values="0"/></filter>`,
    '</defs>',
    `<rect width="${W}" height="${H}" fill="${PAPER}"/>`,
    ...grid,
    `<text x="-12" y="${H + 46}" font-family="UDEV Gothic HSLG" font-size="300" fill="${FAINT}" letter-spacing="-12">${escapeXml(giant)}</text>`,
    draw(LIGHT),
    `<path d="${band}" fill="${INK}"/>`,
    `<g clip-path="url(#band)">${draw(DARK)}</g>`,
    `<rect x="${r(bandX)}" y="${bandTop}" width="112" height="68" fill="${INK}"/>`,
    text(bandX + 20, bandTop + 34, `FIG.${String(motifIndex + 1).padStart(2, '0')}`, 13, PAPER),
    text(bandX + 20, bandTop + 54, name, 13, '#8a8a86'),
    `<g clip-path="url(#hz)">${hazard.join('')}</g>`,
    ...crop,
    line(160, H - 56, 1120, H - 56, INK),
    ...ticks,
    text(96, 82, `${kind.toUpperCase()} // ${code}`, 14, INK),
    text(W - 96, 82, 'MIKAN-919', 14, INK, 'end'),
    text(W - 96, H - 76, `${(random() * 90).toFixed(3)}N / ${(random() * 180).toFixed(3)}E`, 12, INK, 'end'),
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.07"/>`,
    '</svg>',
  ].join('')
}
