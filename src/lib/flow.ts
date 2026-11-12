// ページ遷移で、クリックしたものと行き先の対応する要素を、位置と大きさをつないで移す
// (View Transitions の共有要素。FLIP の計算はブラウザーに任せる)。対応の名前は flip-head / flip-cover / flip-title。
// - 元のページ: クリックしたリンク a[data-flip] の [data-flip-part](無ければリンク自体を head)。
//   それ以外の遷移(戻る・ヘッダーのリンクなど)では、そのページ自身の [data-flip-page]
// - 行き先: 元が a[data-flip] なら、そのページの [data-flip-page]。そうでなければ、元のページへのリンク
//   a[data-flip](戻ってきたカードやタイル。ページ送りの中なら見えるページへ送る)、無ければ [data-flip-page]
// 名前は遷移の間だけ付ける(ページ送りの View Transition に混ざらないように)。
// 浅い階層へ戻るときは html[data-flow="up"] にして、画面が流れる向きを逆にする(global.css)。

// 末尾のスラッシュの有無をそろえる。
const clean = (path: string) => path.replace(/\/+$/, '') || '/'
const depth = (path: string) => clean(path).split('/').filter(Boolean).length

let named: HTMLElement[] = []
let from = ''
let fromLink = false
let up = false

const name = (el: HTMLElement, part: string) => {
  el.style.viewTransitionName = `flip-${part}`
  el.style.setProperty('view-transition-class', 'flip')
  named.push(el)
}
const nameLink = (link: HTMLElement) => {
  const parts = link.querySelectorAll<HTMLElement>('[data-flip-part]')
  if (!parts.length) return name(link, 'head')
  for (const part of parts) name(part, part.dataset.flipPart ?? 'head')
}
const namePage = () => {
  for (const el of document.querySelectorAll<HTMLElement>('[data-flip-page]')) name(el, el.dataset.flipPage ?? 'head')
}
const clear = () => {
  for (const el of named) {
    el.style.viewTransitionName = ''
    el.style.removeProperty('view-transition-class')
  }
  named = []
  delete document.documentElement.dataset.flow
}

// 戻ってきたカードがページ送りの先のページにあれば、そのページを表示しておく(pager.ts は今の位置から始める)。
const reveal = (el: HTMLElement) => {
  const pager = el.closest<HTMLElement>('[data-pager]')
  if (!pager) return
  const step = pager.clientWidth + (Number.parseFloat(getComputedStyle(pager).columnGap) || 0)
  const x = el.getBoundingClientRect().left - pager.getBoundingClientRect().left + pager.scrollLeft
  pager.scrollLeft = Math.floor((x + 1) / step) * step
}

document.addEventListener('astro:before-preparation', event => {
  clear()
  // 戻る操作ではイベントの時点で location が戻り先に変わっているので、遷移元はイベントから取る。
  from = clean(event.from.pathname)
  up = depth(event.to.pathname) < depth(from)
  const source = event.sourceElement?.closest<HTMLElement>('a[data-flip]')
  fromLink = Boolean(source)
  if (source) nameLink(source)
  else namePage()
  if (up) document.documentElement.dataset.flow = 'up'
})

document.addEventListener('astro:before-swap', event => {
  event.viewTransition.finished.finally(clear)
})

document.addEventListener('astro:after-swap', () => {
  // ルート要素の属性は新しいページのものに入れ替わるので、向きを付け直す。
  if (up) document.documentElement.dataset.flow = 'up'
  const back = fromLink
    ? undefined
    : [...document.querySelectorAll<HTMLAnchorElement>('a[data-flip]')].find(
        a => clean(new URL(a.href).pathname) === from,
      )
  if (!back) return namePage()
  nameLink(back)
  reveal(back)
})

export {}
