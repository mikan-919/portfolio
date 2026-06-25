# Plan 001: フィルタースクリプトを View Transitions 対応に修正する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/components/blog/BlogArchive.astro src/components/works/WorksArchive.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`BlogArchive.astro` と `WorksArchive.astro` の両方に `document.addEventListener("DOMContentLoaded", ...)` でフィルタースクリプトを初期化するコードがある。Astro の ClientRouter（View Transitions）では `DOMContentLoaded` は最初のページロード時にしか発火しないため、ユーザーがページから離れて戻ってくると、フィルターボタンを押しても何も起きなくなる。Astro が提供する `astro:page-load` イベントは各ページ遷移後に必ず発火するため、これに置き換えることで修正できる。

## Current state

**関連ファイル:**
- `src/components/blog/BlogArchive.astro` — ブログ一覧ページ。フィルタースクリプトあり（約50行目以降の `<script>` ブロック）
- `src/components/works/WorksArchive.astro` — 制作実績一覧ページ。フィルタースクリプトあり（`<script>` ブロック）

**BlogArchive.astro の現状（`<script>` ブロック冒頭）:**
```astro
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const buttons = document.querySelectorAll(".filter-btn");
        const items = document.querySelectorAll(".article-item");
        const noResults = document.getElementById("no-results");

        function filterArticles(tag: string) {
            // ...
        }

        // Click handlers
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                // ...
            });
        });

        // Initial load from URL
        const params = new URLSearchParams(window.location.search);
        const initialTag = params.get("tag");
        if (initialTag) {
            const isValidTag = Array.from(buttons).some(
                (b) => b.getAttribute("data-filter") === initialTag,
            );
            if (isValidTag) {
                filterArticles(initialTag);
            }
        }
    });
</script>
```

**WorksArchive.astro の現状（`<script>` ブロック冒頭）:**
```astro
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const buttons = document.querySelectorAll(".filter-btn");
        const items = document.querySelectorAll(".work-item");
        // ...
    });
</script>
```

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。Biome でフォーマット。

## Commands you will need

| Purpose    | Command                    | Expected on success       |
|------------|----------------------------|---------------------------|
| Typecheck  | `bun run astro check`      | exit 0, no errors         |
| Format     | `bun run fmt`              | exit 0                    |
| Build      | `bun run build`            | exit 0                    |

## Scope

**In scope:**
- `src/components/blog/BlogArchive.astro`
- `src/components/works/WorksArchive.astro`

**Out of scope:**
- `src/components/blog/BlogFilter.astro` — フィルターボタンの HTML のみ、スクリプトなし
- `src/components/works/WorksFilter.astro` — 同上
- その他すべてのファイル

## Git workflow

- Branch: `fix/filter-view-transitions`
- Commit message 例（日本語、type/scope なし）: `フィルタースクリプトを astro:page-load に移行し View Transitions 対応`

## Steps

### Step 1: BlogArchive.astro の `DOMContentLoaded` を `astro:page-load` に置き換える

`src/components/blog/BlogArchive.astro` の `<script>` ブロック内で、以下の置き換えを行う:

**Before:**
```js
document.addEventListener("DOMContentLoaded", () => {
```

**After:**
```js
document.addEventListener("astro:page-load", () => {
```

変更箇所は1行のみ。スクリプトロジック（filterArticles 関数、クリックハンドラ、URL パラメータ処理）はすべてそのまま保持する。

**Verify**: `grep -n "DOMContentLoaded" src/components/blog/BlogArchive.astro` → 出力なし（0件）

### Step 2: WorksArchive.astro の `DOMContentLoaded` を `astro:page-load` に置き換える

`src/components/works/WorksArchive.astro` の `<script>` ブロック内で同様に置き換える:

**Before:**
```js
document.addEventListener("DOMContentLoaded", () => {
```

**After:**
```js
document.addEventListener("astro:page-load", () => {
```

**Verify**: `grep -n "DOMContentLoaded" src/components/works/WorksArchive.astro` → 出力なし（0件）

### Step 3: 残存する DOMContentLoaded がないか確認する

**Verify**: `grep -rn "DOMContentLoaded" src/` → 出力なし（0件）

### Step 4: 型チェックとビルドを実行する

**Verify**:
```sh
bun run astro check
```
→ exit 0、エラーなし

```sh
bun run build
```
→ exit 0

## Test plan

このプロジェクトにはテストスイートが存在しない。動作確認は手動で行う:

1. `bun run dev` でローカルサーバーを起動
2. `/blog` に遷移 → フィルターボタンをクリックして絞り込みが動作することを確認
3. トップページに戻り、再度 `/blog` に遷移 → フィルターが再び動作することを確認（これが本修正で直るバグ）
4. `/works` で同様に確認

## Done criteria

- [ ] `grep -rn "DOMContentLoaded" src/` が0件
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] 変更されたファイルが `BlogArchive.astro` と `WorksArchive.astro` のみ（`git status` で確認）
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- 現状コードが上記 "Current state" の抜粋と一致しない（ドリフトの可能性）
- `astro:page-load` 以外の Astro ライフサイクルイベントが必要なことが判明した
- `bun run build` がフィルター関連以外のエラーで失敗する

## Maintenance notes

- 将来 `<script>` ブロックを新たに追加する場合、`DOMContentLoaded` の代わりに `astro:page-load` を使うこと。Astro ClientRouter が有効なプロジェクトでは `DOMContentLoaded` は初回ロードでしか発火しない。
- `astro:before-swap` / `astro:after-swap` イベントも存在するが、DOM 操作の初期化には `astro:page-load` が最適。
