import { createSignal, onCleanup, onMount } from 'solid-js'

export default function InfiniteTextBackground() {
  let containerRef: HTMLAnchorElement | undefined
  let canvasRef: HTMLCanvasElement | undefined

  // ホバー状態の管理（これで色を切り替えます）

  const TEXT_CONTENT = 'MIKAN-919'
  // const TEXT_CONTENT = '摘果みかん  MIKAN-919'
  const FONT_SIZE = 96
  const PADDING_X = FONT_SIZE // 文字間の余白
  const ROW_HEIGHT = FONT_SIZE
  const ANGLE_DEG = -30 // 全体の傾き

  // 色定義 (Tailwindの gray-400 と orange-500)
  const COLOR_DEFAULT = '#9ca3af'
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

    // 画面サイズに合わせてCanvasサイズを調整
    const resize = () => {
      if (!containerRef || !canvasRef) return
      // 傾ける分、画面サイズより大きく描画領域を確保する
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
      class='absolute inset-0 overflow-hidden select-none flex items-center justify-center bg-gray-50 group grayscale-100 hover:grayscale-0 transition-all duration-300'
    >
      {/* Canvas本体 */}
      <canvas
        ref={canvasRef}
        class='absolute inset-0 w-full h-full block'
      />

      {/* すりガラスレイヤー */}
      <div class='absolute inset-y-0 right-0 w-1/2 bg-white/50 group-hover:bg-white/25 backdrop-blur-sm group-hover:backdrop-blur-xs transition-all duration-300  border-l-2 border-black z-10 pointer-events-none' />
      <div class='absolute inset-y-0 left-0 w-1/2 bg-white/75 backdrop-blur-md group-hover:bg-white/50 group-hover:backdrop-blur-sm transition-all duration-300 z-10 pointer-events-none' />

      {/* Update Box */}
      <div class='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
        <div class='relative text-center border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 pointer-events-auto'>
          <p class='text-xs font-bold mb-1'>LATEST UPDATE</p>
          <p class='text-3xl font-black tracking-tighter'>2024.11.21</p>
        </div>
      </div>
    </a>
  )
}
