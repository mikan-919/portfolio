// 1画面に収まらない中身を横方向のページに分け、送るたびに View Transition で切り替える。
// [data-pager] は横へはみ出す要素(1段組みの段・横並びのグリッド・画面の列)。1ページの幅は clientWidth + column-gap。
// 操作: ホイール / キー(←→↑↓・PageUp/PageDown・Space・Home/End) / 横スワイプ /
//       [data-pager-prev] [data-pager-next] [data-pager-to="n"] / 中身を指すページ内リンク
// 表示: [data-pager-now] [data-pager-total]、[data-pager-ui](2ページ以上で表示)、--pager-progress(0〜1)、
//       現在のページの [data-pager-to] と、現在地の目次リンク([data-pager-toc] 内)に aria-current
// JS が無いときはネイティブの横スクロールのまま。中身を絞り込んだら 'pager:refresh' を送る。

const reduce = matchMedia('(prefers-reduced-motion: reduce)')
const pad = (value: number) => String(value).padStart(2, '0')

// target から上へたどり、delta の向きにまだスクロールできる要素があれば true(コードブロックなどは自分でスクロールさせる)。
const scrollable = (target: EventTarget | null, delta: number, horizontal: boolean): boolean => {
  for (
    let node = target instanceof Element ? target : null;
    node && node !== document.body;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node)
    if (!/auto|scroll/.test(horizontal ? style.overflowX : style.overflowY)) continue
    const [position, size, view] = horizontal
      ? [node.scrollLeft, node.scrollWidth, node.clientWidth]
      : [node.scrollTop, node.scrollHeight, node.clientHeight]
    if (delta > 0 ? position + view < size - 1 : position > 0) return true
  }
  return false
}

const mount = (el: HTMLElement): (() => void) => {
  let page = 0
  let busy = false
  let alive = true
  let armed = true
  let quiet = 0
  let touch: number[] | null = null

  const all = <T extends Element>(selector: string) => document.querySelectorAll<T>(selector)
  const gap = () => Number.parseFloat(getComputedStyle(el).columnGap) || 0
  const step = () => el.clientWidth + gap()
  const total = () => Math.max(1, Math.ceil((el.scrollWidth + gap()) / step() - 0.01))
  // 最後のページは右端で止まる(端数のページは左へ寄る)ので、端にいれば最後のページとみなす。
  const current = () =>
    el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 ? total() - 1 : Math.round(el.scrollLeft / step())
  const pageOf = (target: Element) =>
    Math.floor((target.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft + 1) / step())

  const render = () => {
    if (!alive) return
    const count = total()
    page = Math.min(page, count - 1)
    el.scrollLeft = page * step()
    for (const node of all('[data-pager-now]')) node.textContent = pad(page + 1)
    for (const node of all('[data-pager-total]')) node.textContent = pad(count)
    for (const node of all<HTMLElement>('[data-pager-ui]')) node.hidden = count < 2
    for (const node of all<HTMLButtonElement>('[data-pager-prev]')) node.disabled = page === 0
    for (const node of all<HTMLButtonElement>('[data-pager-next]')) node.disabled = page === count - 1
    for (const node of all<HTMLElement>('[data-pager-to]'))
      node.ariaCurrent = Number(node.dataset.pagerTo) === page ? 'true' : null
    document.documentElement.style.setProperty('--pager-progress', String(count > 1 ? page / (count - 1) : 1))
    // 目次: このページまでに始まった最後の見出しを現在地にする。
    const links = [...all<HTMLAnchorElement>('[data-pager-toc] a[href^="#"]')]
    const active = links.findLast(link => {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)))
      return target && pageOf(target) <= page
    })
    for (const link of links) link.ariaCurrent = link === active ? 'location' : null
  }

  const go = (next: number) => {
    const target = Math.max(0, Math.min(total() - 1, next))
    if (busy || target === page) return
    const update = () => {
      page = target
      render()
    }
    if (reduce.matches || !document.startViewTransition) return update()
    busy = true
    el.style.viewTransitionName = 'pager'
    const transition = document.startViewTransition({ update, types: [target > page ? 'page-next' : 'page-prev'] })
    transition.finished.finally(() => {
      el.style.viewTransitionName = ''
      busy = false
    })
  }

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return // ピンチズーム
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    const delta = horizontal ? event.deltaX : event.deltaY
    if (scrollable(event.target, delta, horizontal)) return
    event.preventDefault()
    // 慣性スクロールで何ページも進まないよう、ホイールが途切れるまで次を受け付けない。
    clearTimeout(quiet)
    quiet = window.setTimeout(() => {
      armed = true
    }, 160)
    if (!armed || Math.abs(delta) < 4) return
    armed = false
    go(page + Math.sign(delta))
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const focus = event.target instanceof Element ? event.target : null
    if (focus?.closest('input, textarea, select, [contenteditable]')) return
    if (event.key === ' ' && focus?.closest('a, button, summary')) return
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      PageDown: 1,
      ' ': event.shiftKey ? -1 : 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      PageUp: -1,
      Home: -page,
      End: total(),
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    go(page + move)
  }

  const onClick = (event: MouseEvent) => {
    const origin = event.target instanceof Element ? event.target : null
    const control = origin?.closest<HTMLElement>('[data-pager-prev], [data-pager-next], [data-pager-to]')
    if (control) {
      event.preventDefault() // [data-pager-to] はリンクにもできる(JS が無いときは素のページ内リンク)
      const to = control.dataset.pagerTo
      go(to === undefined ? page + (control.hasAttribute('data-pager-next') ? 1 : -1) : Number(to))
      return
    }
    // ページ内リンク(目次など)は、指す要素のあるページへ送る。
    const link = origin?.closest<HTMLAnchorElement>('a[href^="#"]')
    const target = link && document.getElementById(decodeURIComponent(link.hash.slice(1)))
    if (!target || !el.contains(target)) return
    event.preventDefault()
    go(pageOf(target))
  }

  const onDown = (event: PointerEvent) => {
    touch = event.pointerType === 'mouse' ? null : [event.clientX, event.clientY]
  }
  const onUp = (event: PointerEvent) => {
    if (!touch) return
    const dx = event.clientX - touch[0]
    const dy = event.clientY - touch[1]
    touch = null
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(page + (dx < 0 ? 1 : -1))
  }
  // フォーカス移動やページ内検索でブラウザがずらしたときは、そのページへ揃え直す。
  const sync = () => {
    if (busy) return
    page = current()
    render()
  }
  const refresh = () => {
    page = 0
    render()
  }

  addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('keydown', onKey)
  document.addEventListener('click', onClick, true) // ClientRouter より先に処理する
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', () => {
    touch = null
  })
  el.addEventListener('onscrollend' in window ? 'scrollend' : 'scroll', sync)
  el.addEventListener('load', render, true) // 画像の読み込みでページ数が変わる
  el.addEventListener('pager:refresh', refresh)
  const observer = new ResizeObserver(render)
  observer.observe(el)
  document.fonts.ready.then(render)
  el.setAttribute('data-pager-ready', '')

  return () => {
    alive = false
    clearTimeout(quiet)
    removeEventListener('wheel', onWheel)
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onClick, true)
    observer.disconnect()
  }
}

let disposers: (() => void)[] = []

document.addEventListener('astro:page-load', () => {
  disposers = [...document.querySelectorAll<HTMLElement>('[data-pager]')].map(mount)
})

document.addEventListener('astro:before-swap', () => {
  for (const dispose of disposers) dispose()
  disposers = []
})

export {}
