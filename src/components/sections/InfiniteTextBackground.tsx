import { onCleanup, onMount } from 'solid-js'

/**
 * 周期的なパルス速度を計算する関数 (v(t) = A * |sin(pi*t/P)|^N)
 * @param t - 時間 (秒)
 * @param A - 振幅 (最大速度, px/s)
 * @param P - 周期 (繰り返し間隔, 秒)
 * @param N - パルスの鋭さ
 */
function sinPowerPulseSpeed(t: number, A: number, P: number, N: number): number {
  const normalizedTime = (Math.PI / P) * t
  const pulseValue = Math.abs(Math.sin(normalizedTime))
  return A * Math.pow(pulseValue, N)
}

export default function InfiniteTextBackground() {
  let canvasRef: HTMLCanvasElement | undefined

  // --- 定数設定 ---
  const TEXT_CONTENT = 'MIKAN-919'
  const FONT_SIZE = 96
  const PADDING_X = FONT_SIZE / 2
  const ROW_HEIGHT = FONT_SIZE - 25
  const ANGLE_DEG = -30
  const TEXT_COLOR = '#068ce9'

  // --- アニメーションパラメータ ---
  const PHASE_OFFSET_PER_ROW = 0.3 // 1行あたりのパルス時刻のズレ (秒)
  const BASE_SPEED = 60 // 線形スクロールのベース速度 (px/秒)
  const BASE_SPEED_OFFSET_PER_ROW = -6 // 1行あたりの線形スクロールのベース速度のズレ (px/秒)
  const PULSE_AMPLITUDE = 1700 // パルスによる最大速度 (px/秒)
  const PULSE_PERIOD = 5 // パルス加速の繰り返し周期 (秒)
  const PULSE_SHARPNESS = 32 // パルスの鋭さ

  onMount(() => {
    if (!canvasRef) return

    const ctx = canvasRef.getContext('2d')
    if (!ctx) return
    const computedStyle = getComputedStyle(canvasRef)

    const canvasFont = computedStyle.getPropertyValue('--font-figtree')

    let animationFrameId: number
    let startTime: number | null = null
    let lastTime = 0
    let rowScrollPositions: number[] = []

    const resize = () => {
      requestAnimationFrame(() => {
        if (!canvasRef) return
        const computedStyle = getComputedStyle(canvasRef)
        const width = Number.parseFloat(computedStyle.width)
        const height = Number.parseFloat(computedStyle.height)
        const dpr = window.devicePixelRatio || 1
        canvasRef.width = width * dpr
        canvasRef.height = height * dpr
        ctx.scale(dpr, dpr)

        const rowCount = Math.ceil((canvasRef.height + 800) / ROW_HEIGHT)
        if (rowScrollPositions.length !== rowCount) {
          rowScrollPositions = Array(rowCount).fill(0)
        }
      })
    }

    const render = (currentTime: number) => {
      if (!canvasRef || !ctx) return

      if (startTime === null) startTime = currentTime

      const totalTime = (currentTime - startTime) / 1000
      const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000

      // キャンバス準備
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height)
      ctx.font = `900 ${FONT_SIZE}px ${canvasFont}`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = TEXT_COLOR

      const textMetrics = ctx.measureText(TEXT_CONTENT)
      const textWidth = textMetrics.width + PADDING_X

      // 全体回転
      ctx.save()
      ctx.translate(canvasRef.width / 2, canvasRef.height / 2)
      ctx.rotate((ANGLE_DEG * Math.PI) / 180)
      ctx.translate(-canvasRef.width / 2, -canvasRef.height / 2)

      const startY = canvasRef.height / 2 + FONT_SIZE
      const endY = canvasRef.height + FONT_SIZE * 3
      const startX = -textWidth * 2
      const endX = canvasRef.width + textWidth

      const rowCount = Math.ceil((endY - startY) / ROW_HEIGHT)
      if (rowScrollPositions.length !== rowCount) {
        rowScrollPositions = Array(rowCount).fill(0)
      }
      // 行ごとの描画
      for (let i = 0; i < rowCount; i++) {
        const y = startY + i * ROW_HEIGHT

        // 行ごとの仮想時刻を計算し、パルス速度を決定
        const rowTotalTime = totalTime + i * PHASE_OFFSET_PER_ROW
        const currentSpeed = sinPowerPulseSpeed(rowTotalTime, PULSE_AMPLITUDE, PULSE_PERIOD, PULSE_SHARPNESS)

        // 線形移動とパルス移動を計算し、累積
        const linearMoveForThisFrame = (BASE_SPEED + i * BASE_SPEED_OFFSET_PER_ROW) * deltaTime
        const pulseMoveForThisFrame = currentSpeed * deltaTime
        rowScrollPositions[i] += linearMoveForThisFrame + pulseMoveForThisFrame

        // 累積移動量を正規化して描画オフセットを決定
        let drawOffset = rowScrollPositions[i]
        if (textWidth > 0) {
          drawOffset = drawOffset % textWidth
          if (drawOffset < 0) drawOffset += textWidth
        } else {
          drawOffset = 0
        }
        drawOffset = drawOffset % textWidth

        // 描画ループ
        let drawX = startX + drawOffset
        while (drawX < endX) {
          ctx.fillText(TEXT_CONTENT, drawX, y)
          drawX += textWidth
        }
      }

      ctx.restore()

      lastTime = currentTime
      animationFrameId = requestAnimationFrame(render)
    }

    document.fonts.ready.then(() => {
      resize()
      render(0)
    })

    window.addEventListener('resize', resize)

    onCleanup(() => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    })
  })

  return (
    <canvas
      ref={canvasRef}
      class='block absolute z-10 mix-blend-difference inset-0 w-full h-full saturate-0 blur-xs duration-600 group-hover:saturate-100 transition-all transform-gpu'
    />
  )
}
