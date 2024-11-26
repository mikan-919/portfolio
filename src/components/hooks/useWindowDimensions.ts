import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export const useWindowDimensions = (window: Window, delay = 100) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    // デバウンスされたリサイズ処理
    const handleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, delay)

    // リスナーを登録
    window.addEventListener('resize', handleResize)

    // クリーンアップ処理
    return () => {
      handleResize.cancel()
      window.removeEventListener('resize', handleResize)
    }
  }, [delay, window])

  return dimensions
}
