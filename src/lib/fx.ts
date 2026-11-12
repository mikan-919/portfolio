// HTML-in-Canvas(Chrome 157+)。[data-fx] の中身を実DOMのまま WebGL テクスチャとして描く。
// 起動時は横スライスが揃い、ポインターが動いている間はその周辺が粒子に分解される。
// 非対応環境では何もしない(通常の HTML が表示される)。

type DrawableCanvas = HTMLCanvasElement & {
  getElementImageDefaultSize: (element: Element) => { width: number; height: number }
  updateElementGeometry: (element: Element, options: { canvasTransform: DOMMatrix }) => void
}
type DrawableGL = WebGL2RenderingContext & {
  texElementSubImage2D: (target: number, level: number, x: number, y: number, element: Element) => void
}

const VERTEX = `#version 300 es
void main() { gl_Position = vec4(vec2(gl_VertexID & 1, gl_VertexID >> 1) * 4. - 1., 0, 1); }`

// 座標はすべて左上原点の canvas ピクセル。出力は premultiplied alpha。
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D T;
uniform vec2 R, S, P; // canvas / texture / pointer
uniform float B, L, D; // boot 0..1 / lens 0..1 / device pixel ratio
uniform vec3 A; // accent
out vec4 o;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 tex(vec2 p) {
  vec2 uv = p / S;
  if (uv != clamp(uv, 0., 1.)) return vec4(0);
  vec4 c = texture(T, uv);
  return vec4(c.rgb * c.a, c.a); // 要素のテクスチャは非 premultiplied で届く
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, R.y - gl_FragCoord.y);

  // 起動: 帯ごとに横へずれた状態から揃う。ずれている間は柿色の残像を重ねる。
  float e = pow(1. - B, 3.);
  float band = floor(p.y / (14. * D));
  float shift = (hash(vec2(band, 7.)) - .5) * R.x * .5 * e;
  vec2 q = p + vec2(shift, 0);
  vec4 c = tex(q);
  float ghost = tex(q + vec2(24. * D * e, 0)).a * e;
  c = c + vec4(A, 1) * ghost * (1. - c.a);

  // レンズ: セル単位でポインターから押し出し、小さな正方形として描く。
  float cell = 5. * D;
  vec2 center = (floor(p / cell) + .5) * cell;
  vec2 away = center - P;
  float f = L * smoothstep(170. * D, 0., length(away));
  if (f > .001) {
    float n = hash(center);
    vec2 src = center - normalize(away + .001) * f * (10. + 70. * n) * D;
    vec4 grain = tex(src);
    vec2 d = abs(p - center) / cell;
    grain *= step(max(d.x, d.y), .5 - .32 * f);
    grain.rgb = mix(grain.rgb, A * grain.a, step(.55, n) * f);
    c = mix(c, grain, smoothstep(0., .2, f));
  }

  // 走査線より下はまだ描かない。
  float scan = B * 1.2 * R.y;
  c *= step(p.y, scan);
  c += vec4(A, 1) * step(abs(p.y - scan), D) * step(B, .99) * (1. - c.a);
  o = c;
}`

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
  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const u = {
    R: uniform('R'),
    S: uniform('S'),
    P: uniform('P'),
    B: uniform('B'),
    L: uniform('L'),
    D: uniform('D'),
    A: uniform('A'),
  }
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // 高さを固定してから中身を canvas へ移す(canvas は子要素の高さに追従しないため)。
  canvas.style.height = `${content.offsetHeight}px`
  content.setAttribute('drawable', '')
  canvas.append(content)
  host.append(canvas)
  host.setAttribute('data-fx-ready', '')

  let texWidth = 0
  let texHeight = 0
  let accentCss = ''
  let pointer = [0, 0]
  let boot = 0
  let lens = 0
  let lensTarget = 0
  let frame = 0
  let last = 0
  let moved = 0

  const draw = () => {
    if (!texWidth) return
    const dpr = canvas.width / canvas.clientWidth
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.R, canvas.width, canvas.height)
    gl.uniform2f(u.S, texWidth, texHeight)
    gl.uniform2f(u.P, pointer[0] * dpr, pointer[1] * dpr)
    gl.uniform1f(u.B, boot)
    gl.uniform1f(u.L, lens)
    gl.uniform1f(u.D, dpr)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // 演出が動いている間だけ rAF を回す。
  const tick = (now: number) => {
    const dt = Math.min(now - last, 50)
    last = now
    boot = Math.min(1, boot + dt / 1000)
    // ポインターが止まったら粒子を戻す(指している文字が読めるように)。
    if (now - moved > 160) lensTarget = 0
    lens += (lensTarget - lens) * Math.min(1, dt / 140)
    draw()
    frame = boot < 1 || lensTarget > 0 || lens > 0.002 ? requestAnimationFrame(tick) : 0
  }
  const kick = () => {
    if (frame) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  canvas.addEventListener('paint', () => {
    const size = canvas.getElementImageDefaultSize(content)
    const width = Math.ceil(size.width)
    const height = Math.ceil(size.height)
    if (!width || !height) return
    const first = !texWidth
    if (width !== texWidth || height !== texHeight) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      texWidth = width
      texHeight = height
    }
    gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, content)
    // 描画位置は DOM の位置と同じなので恒等変換でヒットテストを合わせる。
    canvas.updateElementGeometry(content, { canvasTransform: new DOMMatrix() })
    const css = getComputedStyle(host).getPropertyValue('--color-lp-highlight')
    if (css !== accentCss) {
      accentCss = css
      const [r, g, b] = toRgb(css)
      gl.uniform3f(u.A, r, g, b)
    }
    if (first) kick()
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

  host.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect()
    pointer = [event.clientX - rect.left, event.clientY - rect.top]
    lensTarget = 1
    moved = performance.now()
    kick()
  })

  return () => {
    cancelAnimationFrame(frame)
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
