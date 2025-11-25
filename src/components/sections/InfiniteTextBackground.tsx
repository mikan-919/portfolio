import { onCleanup, onMount } from 'solid-js'

export default function InfiniteTextBackground() {
  let containerRef: HTMLAnchorElement | undefined
  let canvasRef: HTMLCanvasElement | undefined

  const TEXT_CONTENT = 'MIKAN-919'
  const FONT_SIZE = 96
  const PADDING_X = FONT_SIZE // 文字間の余白
  const ROW_HEIGHT = FONT_SIZE
  const ANGLE_DEG = -30 // 全体の傾き

  const COLOR_HOVER = '#f97316'

  onMount(() => {
    if (!canvasRef || !containerRef) return

    const ctx = canvasRef.getContext('2d')
    if (!ctx) return
    const computedStyle = window.getComputedStyle(canvasRef)

    // Retrieve the value of the CSS variable
    const canvasFont = computedStyle.getPropertyValue('--font-rampart-one')

    let animationFrameId: number
    let time = 39000

    const resize = () => {
      if (!containerRef || !canvasRef) return
      const width = containerRef.offsetWidth
      const height = containerRef.offsetHeight

      // Retinaディスプレイ対応（解像度を2倍に）
      const dpr = window.devicePixelRatio || 1
      canvasRef.width = width * dpr
      canvasRef.height = height * dpr

      // CSS上のサイズ
      canvasRef.style.width = `${width}px`
      canvasRef.style.height = `${height}px`

      // スケール調整
      ctx.scale(dpr, dpr)
    }

    // 描画ループ
    const render = () => {
      if (!containerRef || !canvasRef || !ctx) return

      const width = containerRef.offsetWidth
      const height = containerRef.offsetHeight

      // キャンバスをクリア
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(0, 0, width, height)

      // フォント設定
      ctx.font = `900 ${FONT_SIZE}px ${canvasFont}`
      ctx.textBaseline = 'middle'

      // 現在の色決定
      ctx.fillStyle = COLOR_HOVER
      // 色の変化をアニメーションさせたい場合はここで線形補間すると滑らかになりますが、今回はパキッと切り替え

      // テキスト幅を計測
      const textMetrics = ctx.measureText(TEXT_CONTENT)
      const textWidth = textMetrics.width + PADDING_X

      // 全体を傾けるための座標変換
      ctx.save()

      // 中心を軸に回転
      ctx.translate(width / 2, height / 2)
      ctx.rotate((ANGLE_DEG * Math.PI) / 180)
      ctx.translate(-width / 2, -height / 2)

      // 画面を埋めるのに必要な行数・列数（回転分を考慮して広めに計算）
      // 画面サイズよりかなり広く描画しないと、回転した時に端が見切れる
      const extraMargin = 400
      const startY = -extraMargin
      const endY = height + extraMargin
      const startX = -extraMargin
      const endX = width + extraMargin

      const rowCount = Math.ceil((endY - startY) / ROW_HEIGHT)

      // 行ごとの描画
      for (let i = 0; i < rowCount; i++) {
        const y = startY + i * ROW_HEIGHT
        const isRight = 1

        const baseSpeed = 0.21 + Math.sin(i * 0.35) * 0.2 // 1.0 ~ 2.0px/frame
        const linearMove = time * baseSpeed
        const fluctuation = 0
        // const fluctuation = Math.sin(time / 16 - i / 8) * 3
        const totalDistance = linearMove + fluctuation
        let offsetX = totalDistance % textWidth

        if (!isRight) {
          offsetX = -offsetX
        }
        if (isRight) {
          offsetX -= textWidth
        }

        let currentX = startX + offsetX
        while (currentX > startX) {
          currentX -= textWidth
        }
        // 描画ループ
        while (currentX < endX) {
          ctx.fillText(TEXT_CONTENT, currentX, y)
          currentX += textWidth
        }
      }

      ctx.restore()

      time += 1 // 時間を進める
      animationFrameId = requestAnimationFrame(render)
    }

    // フォントのロード待ち（重要：これがないと初回描画でフォントが反映されないことがある）
    document.fonts.ready.then(() => {
      resize()
      render()
    })

    window.addEventListener('resize', resize)

    onCleanup(() => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    })
  })

  return (
    <a
      href='.'
      ref={containerRef}
      class='group absolute inset-0 flex justify-center items-center bg-gray-50 grayscale-100 hover:grayscale-0 overflow-hidden transition-all duration-300 select-none'
    >
      {/* Canvas本体 */}
      <canvas
        ref={canvasRef}
        class='block absolute inset-0 w-full h-full'
      />

      {/* すりガラスレイヤー */}
      <div class='right-0 z-10 absolute inset-y-0 bg-white/50 group-hover:bg-white/25 backdrop-blur-sm group-hover:backdrop-blur-xs w-1/2 transition-all duration-300 pointer-events-none' />
      <div class='left-0 z-10 absolute inset-y-0 bg-white/75 group-hover:bg-white/50 backdrop-blur-md group-hover:backdrop-blur-sm w-1/2 transition-all duration-300 pointer-events-none' />

      {/* Update Box */}
      <div class='z-20 absolute inset-0 flex justify-center items-center pointer-events-none'>
        <div class='relative bg-white shadow-[6px_6px_0px_0px_#000] p-6 border-2 border-black text-center transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 duration-300 pointer-events-auto'>
          <p class='mb-1 font-bold text-xs'>LATEST UPDATE</p>
          <p class='font-black text-3xl tracking-tighter'>2024.11.21</p>
        </div>
      </div>
    </a>
  )
}
