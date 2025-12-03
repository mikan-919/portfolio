/** @jsxImportSource solid-js */
import { createSignal, For, onCleanup, onMount } from 'solid-js'

interface Heading {
  depth: number
  slug: string
  text: string
}

interface Props {
  headings: Heading[]
}

export default function TableOfContents(props: Props) {
  // H2, H3のみ抽出
  const toc = props.headings.filter(h => h.depth > 1 && h.depth < 4)

  // アクティブなIDを管理するSignal
  const [activeId, setActiveId] = createSignal<string>('')

  // バーの位置・高さ管理
  const [indicatorStyle, setIndicatorStyle] = createSignal({ top: 0, height: 0 })

  let navRef: HTMLElement | undefined

  // インジケーターを動かす関数
  const updateIndicator = (id: string) => {
    if (!navRef) return
    const activeLink = navRef.querySelector(`a[data-slug="${id}"]`) as HTMLElement

    if (activeLink) {
      const listItem = activeLink.closest('li')
      if (listItem) {
        setIndicatorStyle({
          top: listItem.offsetTop,
          height: listItem.offsetHeight,
        })
      }
    }
  }

  onMount(() => {
    // 監視ロジック
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id')
            if (id) {
              setActiveId(id)
              updateIndicator(id)
            }
          }
        })
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0,
      },
    )

    // 監視対象の登録
    document.querySelectorAll('.prose h2, .prose h3').forEach(heading => {
      observer.observe(heading)
    })

    // クリーンアップ（ページ遷移時に自動実行される）
    onCleanup(() => {
      observer.disconnect()
    })
  })

  return (
    <nav
      ref={navRef}
      class='toc-container sticky top-24 self-start hidden lg:block p-8 pr-0 max-h-[calc(100vh-6rem)] overflow-x-hidden overflow-y-auto'
    >
      <p class='font-black font-mono text-xs mb-4 tracking-widest opacity-50'>TIMELINE</p>

      <ul class='relative border-l-2 border-gray-200 space-y-4'>
        {/* 黒いバー：Signalの値に応じてスタイルが自動更新される */}
        <div
          class='absolute left-[-2px] w-[2px] bg-black transition-all duration-300 ease-out'
          style={{
            top: `${indicatorStyle().top}px`,
            height: `${indicatorStyle().height}px`,
          }}
        />

        <For each={toc}>
          {h => (
            <li class={`relative pl-4 ${h.depth === 3 ? 'ml-4 text-xs' : 'text-sm'}`}>
              <a
                href={`#${h.slug}`}
                data-slug={h.slug}
                // クラスの出し分けが宣言的でキレイ
                class={`block transition-colors font-bold leading-tight ${
                  activeId() === h.slug ? 'text-black scale-105' : 'text-gray-400 hover:text-black'
                }`}
                onClick={() => {
                  // クリック時に即座にアクティブにする演出
                  setActiveId(h.slug)
                }}
              >
                {h.text}
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
