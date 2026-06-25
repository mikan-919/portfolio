# Plan 009: タブ非表示時に InfiniteTextBackground のアニメーションを停止する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/components/sections/root/InfiniteTextBackground.tsx`
> If the file changed, compare "Current state" before proceeding.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`InfiniteTextBackground.tsx` の `requestAnimationFrame` ループはタブが非表示になっても動き続ける。`document.visibilitychange` で一時停止・再開するだけで、ユーザーが別タブにいる間の CPU 消費がゼロになる。追加コードは5行程度。

## Current state

**関連ファイル:**
- `src/components/sections/root/InfiniteTextBackground.tsx` — SolidJS コンポーネント。`onMount` 内で `requestAnimationFrame` を使ったアニメーションループを実行

**現状の `onMount` 内アニメーション管理部分（末尾付近）:**
```tsx
    document.fonts.ready.then(() => {
      resize()
      render(0)
    })

    window.addEventListener('resize', resize)

    onCleanup(() => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    })
```

`render` 関数の末尾:
```tsx
    lastTime = currentTime
    animationFrameId = requestAnimationFrame(render)
```

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。SolidJS の `onMount` / `onCleanup` パターンを使用。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/components/sections/root/InfiniteTextBackground.tsx`

**Out of scope:**
- その他すべてのファイル

## Git workflow

- Branch: `perf/pause-canvas-on-hidden`
- Commit message 例: `タブ非表示時にキャンバスアニメーションを停止`

## Steps

### Step 1: visibilitychange ハンドラを追加する

`onMount` 内の `window.addEventListener('resize', resize)` の直後に以下を追加する:

```tsx
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId)
      } else {
        lastTime = 0
        animationFrameId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
```

`onCleanup` のクリーンアップにも追加する:

**Before:**
```tsx
    onCleanup(() => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    })
```

**After:**
```tsx
    onCleanup(() => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    })
```

`lastTime = 0` にリセットする理由: タブ復帰時に `deltaTime` が長時間分になって一瞬大きくジャンプするのを防ぐため（既存の `lastTime === 0 ? 0 : ...` の guard が発動する）。

**Verify**: `grep -n 'visibilitychange' src/components/sections/root/InfiniteTextBackground.tsx` → 2件（addEventListener と removeEventListener）

### Step 2: 型チェックとビルドの確認

**Verify**:
```sh
bun run astro check && bun run build
```
→ 両方 exit 0

## Done criteria

- [ ] `grep -c 'visibilitychange' src/components/sections/root/InfiniteTextBackground.tsx` → `2`
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] 変更されたファイルが `InfiniteTextBackground.tsx` のみ
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `animationFrameId` が `onMount` スコープの外から参照できない構造になっている場合（現状は `let animationFrameId: number` として `onMount` 内で宣言されているため問題ない）

## Maintenance notes

- `lastTime = 0` のリセットはタブ復帰時のジャンプ防止のため。削除しないこと。
- アニメーションのロジックを変更する際は、`cancelAnimationFrame` が `handleVisibility` と `onCleanup` の両方で呼ばれている点に注意。
