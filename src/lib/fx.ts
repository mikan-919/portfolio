// HTML-in-Canvas(Chrome 157+)。[data-fx] の中身を実DOMのまま WebGL テクスチャにし、
// 奥行きの違う板(レイヤー)として3D空間に並べて描く。
// - 起動: 各レイヤーが奥から回転しながら跳ね起き、横スライスが揃う。上から1本の走査線が全レイヤーを描き出す
// - ポインター: ステージ(main)のどこにあっても、ステージ基準の位置で板が傾く(ホームのメニューも同じ基準で傾く)。
//   板の上で動かしている間は、奥のレイヤー(z < 0)だけが周辺から粒子に分解されて弾かれる。
//   文字のレイヤーは崩さない(読む邪魔にならないように)
// - クリック: 波紋が広がり、板が奥へ押されて戻る
// - 数秒おきに短いグリッチ
// 中身の [data-fx-layer="<z>"] は別レイヤーになる(z は CSS px、正が手前)。
// レイヤーは border box で切り取られるので、はみ出す字形には padding を取る。
// 傾けると板の縁が見えるので、縁まで届く奥のレイヤーは中身の端をぼかしておく。
// 非対応環境では何もしない(通常の HTML が表示される)。

type DrawableCanvas = HTMLCanvasElement & {
  getElementImageDefaultSize: (element: Element) => { width: number; height: number }
  updateElementGeometry: (element: Element, options: { canvasTransform: DOMMatrix }) => void
}
type DrawableGL = WebGL2RenderingContext & {
  texElementSubImage2D: (target: number, level: number, x: number, y: number, element: Element) => void
}
type Layer = {
  el: HTMLElement
  z: number
  texture: WebGLTexture
  width: number // texture px
  height: number
  x: number // canvas 内の位置(CSS px)
  y: number
}
type Spring = { x: number; v: number; to: number; k: number; c: number }

const DEPTH = 1200 // perspective(CSS px)
const STAGGER = 0.18 // レイヤーごとの起動の遅れ

// 板の四隅を CSS px の行列 M で射影する。uv は透視補正されて届く。
const VERTEX = `#version 300 es
uniform mat4 M;
uniform vec2 Q, W; // 板 / canvas の大きさ(CSS px)
out vec2 uv;
void main() {
  uv = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  vec4 p = M * vec4(uv * Q, 0, 1);
  gl_Position = vec4(p.x / W.x * 2. - p.w, p.w - p.y / W.y * 2., 0, p.w);
}`

// 座標はすべて板の上のテクスチャ px(左上原点)。出力は premultiplied alpha。
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D T;
uniform vec2 S, P, V, C, W; // texture / pointer / pointer の速度 / クリック位置 / canvas(CSS px)
uniform float B, L, D, G, K, O, Y; // boot / lens / dpr / glitch / 波紋の進行 / 不透明度 / 走査線の高さ(CSS px)
uniform vec3 A; // accent
in vec2 uv;
out vec4 o;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 tex(vec2 p) {
  vec2 t = p / S;
  if (t != clamp(t, 0., 1.)) return vec4(0);
  vec4 c = texture(T, t);
  return vec4(c.rgb * c.a, c.a); // 要素のテクスチャは非 premultiplied で届く
}

void main() {
  vec2 p = uv * S;

  // 起動とグリッチ: 帯ごとに横へずらし、ずれている間は柿色の残像を重ねる。
  float e = pow(1. - B, 3.);
  float g = max(e, G * .6);
  float band = floor(p.y / (14. * D));
  vec2 q = p + vec2((hash(vec2(band, 7. + floor(G * 5.))) - .5) * S.x * (.5 * e + .04 * G), 0);

  // 波紋: クリック位置から広がる輪が中身を外へ押す。
  vec2 fromClick = p - C;
  float wave = exp(-pow((length(fromClick) - K * 1300. * D) / (48. * D), 2.)) * (1. - K);
  q -= normalize(fromClick + .001) * wave * 28. * D;

  vec4 c = tex(q);
  c += vec4(A, 1) * tex(q + vec2(24. * D * g, 0)).a * g * (1. - c.a);
  c.rgb = mix(c.rgb, A * c.a, min(1., wave * 1.6)); // 輪が通った中身を柿色に染める

  // レンズ: セル単位でポインターから押し出し、小さな正方形として描く。速く動かすと進行方向へ飛ぶ。
  float cell = 5. * D;
  vec2 center = (floor(p / cell) + .5) * cell;
  vec2 away = center - P;
  float f = L * smoothstep(190. * D, 0., length(away));
  if (f > .001) {
    float n = hash(center);
    vec2 src = center - (normalize(away + .001) * (10. + 70. * n) + V * n * 2.5) * f * D;
    vec4 grain = tex(src);
    vec2 d = abs(p - center) / cell;
    grain *= step(max(d.x, d.y), .5 - .32 * f);
    grain.rgb = mix(grain.rgb, A * grain.a, step(.55, n) * f);
    c = mix(c, grain, smoothstep(0., .2, f));
  }

  // 走査線より下はまだ描かない。線は画面上の高さで全レイヤー共通にし、1本に見せる。
  float y = W.y - gl_FragCoord.y / D;
  c *= step(y, Y);
  c += vec4(A, 1) * step(abs(y - Y), 1.) * step(Y, W.y) * (1. - c.a);
  o = c * O;
}`

const clamp = (value: number) => Math.min(1, Math.max(0, value))
// 行き過ぎてから戻るイージング。
const back = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2

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

// 画面上の点を、行列 m で射影された板の上の座標へ戻す(z=0 平面のホモグラフィの逆)。
const unproject = (m: DOMMatrix, x: number, y: number): [number, number] => {
  const inverse = new DOMMatrix([
    m.m11,
    m.m12,
    0,
    m.m14,
    m.m21,
    m.m22,
    0,
    m.m24,
    0,
    0,
    1,
    0,
    m.m41,
    m.m42,
    0,
    m.m44,
  ]).inverse()
  const point = inverse.transformPoint({ x, y, z: 0, w: 1 })
  return [point.x / point.w, point.y / point.w]
}

const toRgb = (css: string): number[] => {
  const ctx = new OffscreenCanvas(1, 1).getContext('2d')
  if (!ctx) return [1, 0.4, 0]
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => v / 255)
}

const mount = (host: HTMLElement): (() => void) | undefined => {
  const content = host.querySelector<HTMLElement>(':scope > .fx-content')
  if (!content) return
  const canvas = document.createElement('canvas') as DrawableCanvas
  canvas.setAttribute('content', 'drawable')
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false }) as DrawableGL | null
  if (!gl) return

  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) return
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('fx: shader link failed', gl.getProgramInfoLog(program))
    return
  }
  gl.useProgram(program)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  const u = Object.fromEntries('MQWSPVCBLDGKOAY'.split('').map(name => [name, gl.getUniformLocation(program, name)]))

  // 奥から順に並べる。ルート(z=0)も1枚のレイヤー。
  const layers: Layer[] = [content, ...content.querySelectorAll<HTMLElement>('[data-fx-layer]')]
    .map(el => {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return { el, z: Number(el.dataset.fxLayer ?? 0), texture, width: 0, height: 0, x: 0, y: 0 }
    })
    .sort((a, b) => a.z - b.z)
  const span = 1 + STAGGER * (layers.length - 1)

  // 高さを固定してから中身を canvas へ移す(canvas は子要素の高さに追従しないため)。
  canvas.style.height = `${content.offsetHeight}px`
  for (const layer of layers) layer.el.setAttribute('drawable', '')
  canvas.append(content)
  host.append(canvas)
  host.setAttribute('data-fx-ready', '')

  const perspective = new DOMMatrix()
  perspective.m34 = -1 / DEPTH
  const tilt = { rx: spring(90, 9), ry: spring(90, 9), tz: spring(70, 8) }
  let accentCss = ''
  let pointer = [0, 0] // canvas 基準(CSS px)
  let aim = [0, 0] // ステージ基準(-1〜1)
  let velocity = [0, 0]
  let click = [0, 0]
  let moved = -1e9
  let boot = 0
  let lens = 0
  let lensTarget = 0
  let glitch = 0
  let ripple = 1
  let frame = 0
  let last = 0
  let started = false

  const draw = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const dpr = canvas.width / width
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(u.W, width, height)
    gl.uniform2f(u.V, velocity[0] * dpr, velocity[1] * dpr)
    gl.uniform1f(u.D, dpr)
    gl.uniform1f(u.G, glitch)
    gl.uniform1f(u.K, ripple)
    gl.uniform1f(u.Y, boot * 1.2 * height)
    for (const [index, layer] of layers.entries()) {
      if (!layer.width) continue
      const t = clamp(boot * span - index * STAGGER)
      const rest = 1 - back(t) // 起動の残り。行き過ぎると負になる。
      // 奥行き z の板を、静止時は画面上で等倍になるよう拡大してから置く。
      const matrix = new DOMMatrix()
        .translate(width / 2, height / 2)
        .multiply(perspective)
        .translate(0, 0, tilt.tz.x - rest * 700)
        .rotateAxisAngle(1, 0, 0, tilt.rx.x - rest * 75)
        .rotateAxisAngle(0, 1, 0, tilt.ry.x + rest * 35 * (index % 2 ? -1 : 1))
        .translate(0, 0, layer.z)
        .scale((DEPTH - layer.z) / DEPTH)
        .translate(layer.x - width / 2, layer.y - height / 2)
      const [px, py] = unproject(matrix, pointer[0], pointer[1])
      const [cx, cy] = unproject(matrix, click[0], click[1])
      gl.bindTexture(gl.TEXTURE_2D, layer.texture)
      gl.uniformMatrix4fv(u.M, false, matrix.toFloat32Array())
      gl.uniform2f(u.Q, layer.width / dpr, layer.height / dpr)
      gl.uniform2f(u.S, layer.width, layer.height)
      gl.uniform2f(u.P, px * dpr, py * dpr)
      gl.uniform2f(u.C, cx * dpr, cy * dpr)
      gl.uniform1f(u.B, t)
      gl.uniform1f(u.O, clamp(t * 4))
      gl.uniform1f(u.L, layer.z < 0 ? lens : 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      // 描いた位置へヒットテストと読み上げ位置を合わせる(後に更新した要素が手前になる)。
      canvas.updateElementGeometry(layer.el, { canvasTransform: matrix })
    }
  }

  // ページ送りで横へ外れている間も描かない。
  const visible = (rect: DOMRect) =>
    rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
  // 何かが動いている間だけ rAF を回す。
  const tick = (now: number) => {
    const ms = Math.min(now - last, 50)
    const dt = ms / 1000
    last = now
    const rect = canvas.getBoundingClientRect()
    const active = now - moved < 1400
    tilt.rx.to = active ? -aim[1] * 5 : 0
    tilt.ry.to = active ? aim[0] * 8 : 0
    // ポインターが止まったら粒子を戻す(指している文字が読めるように)。
    if (now - moved > 160) lensTarget = 0
    boot = Math.min(1, boot + ms / 1500)
    lens += (lensTarget - lens) * Math.min(1, ms / 140)
    glitch = Math.max(0, glitch - ms / 350)
    ripple = Math.min(1, ripple + ms / 900)
    velocity = [velocity[0] * 0.85, velocity[1] * 0.85]
    const moving = [step(tilt.rx, dt), step(tilt.ry, dt), step(tilt.tz, dt)].some(Boolean)
    if (visible(rect)) draw()
    frame =
      moving || active || boot < 1 || lensTarget > 0 || lens > 0.002 || glitch > 0 || ripple < 1
        ? requestAnimationFrame(tick)
        : 0
  }
  const kick = () => {
    if (frame || !started) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  canvas.addEventListener('paint', event => {
    const changed = new Set((event as Event & { changedElements: Element[] }).changedElements)
    const dpr = canvas.width / canvas.clientWidth
    for (const layer of layers) {
      // レイアウト上の位置(.fx-content 基準)を端末ピクセルに揃える。
      let x = 0
      let y = 0
      for (
        let node: HTMLElement | null = layer.el;
        node && node !== content;
        node = node.offsetParent as HTMLElement | null
      ) {
        x += node.offsetLeft
        y += node.offsetTop
      }
      layer.x = Math.round(x * dpr) / dpr
      layer.y = Math.round(y * dpr) / dpr
      const size = canvas.getElementImageDefaultSize(layer.el)
      const width = Math.ceil(size.width)
      const height = Math.ceil(size.height)
      if (!width || !height) continue
      const resized = width !== layer.width || height !== layer.height
      if (!resized && !changed.has(layer.el)) continue
      gl.bindTexture(gl.TEXTURE_2D, layer.texture)
      if (resized) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      layer.width = width
      layer.height = height
      gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, layer.el)
    }
    const css = getComputedStyle(host).getPropertyValue('--color-lp-highlight')
    if (css !== accentCss) {
      accentCss = css
      const [r, g, b] = toRgb(css)
      gl.uniform3f(u.A, r, g, b)
    }
    started = true
    if (frame) return
    if (boot < 1) kick()
    else draw()
  })

  const sizeObserver = new ResizeObserver(([entry]) => {
    // 端末エミュレーションでは device-pixel-content-box が DPR を反映しないため、大きい方を採る。
    const [box] = entry.devicePixelContentBoxSize
    canvas.width = Math.max(box.inlineSize, Math.round(entry.contentRect.width * devicePixelRatio))
    canvas.height = Math.max(box.blockSize, Math.round(entry.contentRect.height * devicePixelRatio))
  })
  sizeObserver.observe(canvas, { box: 'device-pixel-content-box' })
  const heightObserver = new ResizeObserver(() => {
    canvas.style.height = `${content.offsetHeight}px`
  })
  heightObserver.observe(content)

  const locate = (event: PointerEvent): number[] => {
    const rect = canvas.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  // ステージのどこで動かしても傾ける。粒子は板の上にあるときだけ出す。
  const scene = host.closest<HTMLElement>('main') ?? host
  scene.addEventListener('pointermove', event => {
    const next = locate(event)
    const now = performance.now()
    if (now - moved < 100) {
      velocity = [velocity[0] * 0.6 + (next[0] - pointer[0]) * 0.4, velocity[1] * 0.6 + (next[1] - pointer[1]) * 0.4]
    }
    const stage = scene.getBoundingClientRect()
    aim = [((event.clientX - stage.left) / stage.width) * 2 - 1, ((event.clientY - stage.top) / stage.height) * 2 - 1]
    const rect = canvas.getBoundingClientRect()
    pointer = next
    moved = now
    lensTarget = next[0] >= 0 && next[1] >= 0 && next[0] <= rect.width && next[1] <= rect.height ? 1 : 0
    kick()
  })
  scene.addEventListener('pointerleave', () => {
    moved = -1e9
    kick()
  })
  host.addEventListener('pointerdown', event => {
    click = locate(event)
    ripple = 0
    tilt.tz.v -= 900
    kick()
  })

  // 画面内で静止しているとき、数秒おきに短いグリッチを入れる。
  let timer = 0
  const scheduleGlitch = () => {
    timer = window.setTimeout(
      () => {
        if (!document.hidden && !frame && visible(canvas.getBoundingClientRect())) {
          glitch = 1
          tilt.ry.v += Math.random() < 0.5 ? 40 : -40
          kick()
        }
        scheduleGlitch()
      },
      4000 + Math.random() * 5000,
    )
  }
  scheduleGlitch()

  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(timer)
    sizeObserver.disconnect()
    heightObserver.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

let disposers: (() => void)[] = []

document.addEventListener('astro:page-load', () => {
  if (!document.documentElement.classList.contains('fx-on')) return
  for (const host of document.querySelectorAll<HTMLElement>('[data-fx]:not([data-fx-ready])')) {
    try {
      const dispose = mount(host)
      if (dispose) disposers.push(dispose)
    } catch (error) {
      console.warn('fx: mount failed', error)
    }
    // 失敗時も中身を表示する。
    host.setAttribute('data-fx-ready', '')
  }
})

document.addEventListener('astro:before-swap', () => {
  for (const dispose of disposers) dispose()
  disposers = []
})
