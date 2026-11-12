// ステージ(main)全体を1つの場面として、マウスの位置へばねで傾ける。全ページで共有する。
// 回転の中心とカメラ(透視 1200px)はステージ中央。[data-scene] の要素へ CSS 変数で配る
// (--scene-rx / --scene-ry / --scene-tz、-1〜1 に直した --scene-x / --scene-y、要素から見た中心 --scene-ox / --scene-oy)。
// 変形の規則は global.css。fx(src/lib/fx.ts)は同じ値で WebGL の板を回す。
// 動かすのをやめて 1.4 秒たつか、ステージの外へ出ると正面へ戻る。タッチと prefers-reduced-motion では傾けない。

type Spring = { x: number; v: number; to: number; k: number; c: number }

const TILT_X = 4 // 最大の傾き(度)。上下
const TILT_Y = 6 // 左右

const spring = (k: number, c: number): Spring => ({ x: 0, v: 0, to: 0, k, c })
// 1ステップ進め、まだ動いていれば true。
const step = (s: Spring, dt: number): boolean => {
  s.v += (s.k * (s.to - s.x) - s.c * s.v) * dt
  s.x += s.v * dt
  if (Math.abs(s.to - s.x) > 0.01 || Math.abs(s.v) > 0.05) return true
  s.x = s.to
  s.v = 0
  return false
}

export const scene = { rx: spring(90, 9), ry: spring(90, 9), tz: spring(70, 8) }

const listeners = new Set<() => void>()
// 場面が動いたフレームごとに呼ぶ。解除する関数を返す。
export const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)')
let stage: HTMLElement | null = null
let followers: HTMLElement[] = []
let aim = [0, 0]
let moved = -1e9
let frame = 0
let last = 0

// 各要素から見たステージ中央。レイアウト上の位置なので、要素自身の傾きの影響を受けない。
const place = () => {
  if (!stage) return
  for (const el of followers) {
    let x = 0
    let y = 0
    for (let node: HTMLElement | null = el; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
      x += node.offsetLeft
      y += node.offsetTop
    }
    el.style.setProperty('--scene-ox', `${stage.clientWidth / 2 - x}px`)
    el.style.setProperty('--scene-oy', `${stage.clientHeight / 2 - y}px`)
  }
}

const publish = () => {
  for (const el of followers) {
    el.style.setProperty('--scene-rx', `${scene.rx.x}deg`)
    el.style.setProperty('--scene-ry', `${scene.ry.x}deg`)
    el.style.setProperty('--scene-tz', `${scene.tz.x}px`)
    el.style.setProperty('--scene-x', String(scene.ry.x / TILT_Y))
    el.style.setProperty('--scene-y', String(-scene.rx.x / TILT_X))
  }
  for (const listener of listeners) listener()
}

const tick = (now: number) => {
  const dt = Math.min(now - last, 50) / 1000
  last = now
  const active = now - moved < 1400
  scene.rx.to = active ? -aim[1] * TILT_X : 0
  scene.ry.to = active ? aim[0] * TILT_Y : 0
  const moving = [step(scene.rx, dt), step(scene.ry, dt), step(scene.tz, dt)].some(Boolean)
  publish()
  frame = moving || active ? requestAnimationFrame(tick) : 0
}
const kick = () => {
  if (frame) return
  last = performance.now()
  frame = requestAnimationFrame(tick)
}

// 場面全体を奥へ押す(fx のクリックの波紋)。
export const push = (velocity: number) => {
  scene.tz.v += velocity
  kick()
}

let observer: ResizeObserver | undefined

document.addEventListener('astro:page-load', () => {
  stage = document.getElementById('main-content')
  followers = [...document.querySelectorAll<HTMLElement>('[data-scene]')]
  place()
  publish()
  if (!stage || reduce.matches) return
  const current = stage
  current.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return
    const rect = current.getBoundingClientRect()
    aim = [((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1]
    moved = performance.now()
    kick()
  })
  current.addEventListener('pointerleave', () => {
    moved = -1e9
    kick()
  })
  observer = new ResizeObserver(place)
  observer.observe(current)
})

document.addEventListener('astro:before-swap', () => {
  observer?.disconnect()
})
