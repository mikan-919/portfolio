# Plan 014: クロール可能な静的タグページを追加する

> **Executor instructions**: 順番に実行。各ステップの検証コマンドで期待結果を確認してから次へ。「STOP conditions」該当時は改善せず報告。完了後 `plans/README.md` の行を更新。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- "src/pages/blog/[...slug]/index.astro" "src/pages/works/[...slug]/index.astro" src/components/blog/BlogArchive.astro src/components/ui/Tags.astro`
> 変更があれば抜粋と現コードを突き合わせ、不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none（Plan 012 と独立。ただし sitemap に載せたいなら 012 後が望ましい）
- **Category**: direction（SEO・回遊）
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

記事・作品の詳細ページではタグが `?tag=` のクエリ URL にリンクされている（`blog/[...slug]/index.astro:83` → `/blog?tag=${tag}`、`works/[...slug]/index.astro:120` → `/works?tag=${tag}`）。一覧側のフィルタは `BlogArchive.astro` のクライアント JS がそのクエリを読んで表示を絞るだけで、**タグ専用の静的 URL が存在しない**。クエリ URL はクロール・共有・直リンクに弱い。さらに `/works?tag=` は works のフィルタが「カテゴリ」基準（`WorksFilter` は `data-filter` にカテゴリを使う）なのでタグ指定が機能しない不整合がある。`/blog/tags/[tag]` のような静的ページを `getStaticPaths` で生成すれば、各タグが固有 URL を持ち、クロール・共有・回遊が改善する。

## Current state

- `src/components/blog/BlogArchive.astro` — タグ抽出ロジックの参照実装:
  ```ts
  const allTags = articles.flatMap((article) => article.data.tags);
  const uniqueTags = ["All", ...new Set(allTags)];
  ```
  クライアント JS が `?tag=` を読んで `.article-item` を表示/非表示する。
- `src/components/blog/BlogList.astro` — 記事カードのリスト描画（タグページでも再利用候補）。
- `src/components/ui/Tags.astro` — `tags: string[]` と `link: (tag) => string` を受け取り `<a href={link(tag)}>#{tag}</a>` を描く。タグ URL の生成はすべてこの `link` 関数経由。
- `src/pages/blog/[...slug]/index.astro:83` — `<Tags tags={entry.data.tags} link={(tag) => `/blog?tag=${tag}`} />`
- `src/pages/works/[...slug]/index.astro:120` — `<Tags tags={entry.data.tags} link={(tag) => `/works?tag=${tag}`} />`（works は `tags` 配列を schema に持つ。`content/config.ts` の worksCollection 参照）
- 既存の動的ルート参考: `src/pages/blog/[...slug]/index.astro` の `getStaticPaths` パターン。

### 規約

- 動的ルートは `getStaticPaths()` で params を列挙（`prerender` は static 出力なので暗黙。works 詳細は明示的に `export const prerender = true` を付けている）。
- ページは `Layout` でラップし `title` / `description` を渡す。
- TypeScript strict、シングルクォート、セミコロン無し。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Typecheck | `bun run astro check` | 0 errors            |
| Lint      | `bunx biome check`    | exit 0              |
| Build     | `bun run build`       | exit 0、`dist/blog/tags/<tag>/index.html` 生成 |

## Scope

**In scope**:
- `src/pages/blog/tags/[tag]/index.astro`（新規）
- `src/pages/works/tags/[tag]/index.astro`（新規）
- `src/pages/blog/[...slug]/index.astro`（`Tags` の `link` を `/blog/tags/${tag}` に変更）
- `src/pages/works/[...slug]/index.astro`（`link` を `/works/tags/${tag}` に変更）

**Out of scope**（変更禁止）:
- `src/components/blog/BlogArchive.astro` のクライアント JS フィルタ — 一覧ページの絞り込み体験はそのまま残す（静的タグページは併存させる）。
- `src/components/works/WorksFilter.astro` / `WorksArchive.astro` のカテゴリフィルタ。
- `src/components/ui/Tags.astro` の実装（`link` prop で吸収できるので変更不要）。

## Git workflow

- Branch: `advisor/014-static-tag-pages`
- conventional commit。例: `feat: ブログ・作品に静的タグページを追加`
- push / PR は指示があるまで行わない。

## Steps

### Step 1: blog のタグページ `src/pages/blog/tags/[tag]/index.astro` を作る

- `getStaticPaths()`: `getCollection('articles')` から全タグを集約（`BlogArchive.astro` の抽出ロジックを参考、ただし `"All"` は含めない）。各ユニークタグについて `{ params: { tag }, props: { tag, articles: そのタグを含む記事 } }` を返す。
- ページ本体: `Layout`（`title={`Portfoliooo | #${tag}`}`、`description` は `#${tag} の記事一覧` 等）でラップし、`BlogList`（既存）で `articles` を描画。先頭に「#tag の記事」の見出しと「← Blog に戻る」リンクを置く。
- タグ名に URL 非安全文字が含まれうる場合に備え、params とフィルタ照合は同一の生文字列で行う（エンコード差異に注意。日本語タグは Astro が自動エンコードする）。

**Verify**: `bun run build` → `ls dist/blog/tags/` に各タグのディレクトリが生成される。`bun run astro check` → 0 errors。

### Step 2: works のタグページ `src/pages/works/tags/[tag]/index.astro` を作る

Step 1 と同構造。`getCollection('works')` の `data.tags` を集約。描画は works 用カード（`WorksList` または `WorkCard.astro` を確認して再利用）。works のカードコンポーネント名は `src/components/works/WorksList.astro` / `src/components/WorkCard.astro` を読んで適切な方を使う。

**Verify**: `bun run build` → `ls dist/works/tags/` に生成。`bun run astro check` → 0 errors。

### Step 3: 詳細ページのタグリンクを静的 URL に向ける

- `src/pages/blog/[...slug]/index.astro:83` の `link={(tag) => `/blog?tag=${tag}`}` を `link={(tag) => `/blog/tags/${tag}`}` に変更。
- `src/pages/works/[...slug]/index.astro:120` の `link={(tag) => `/works?tag=${tag}`}` を `link={(tag) => `/works/tags/${tag}`}` に変更。

**Verify**: `grep -rn "?tag=" src/pages/` → 一致なし（クエリ URL が残っていない）。

### Step 4: 全体ビルドとリンク健全性

```
bun run build
```

**Verify**: exit 0。`grep -rho 'href="/blog/tags/[^"]*"' dist/blog/*/index.html | head` で出るリンク先が、Step 1 で生成された `dist/blog/tags/<tag>/index.html` に対応している（リンク切れがない）。

## Test plan

- テストランナー未導入のためテストは追加しない。
- 検証はビルド成果物の grep（生成ファイルとリンク先の対応）で行う（Done criteria 参照）。

## Done criteria

- [ ] `bun run astro check` exits 0
- [ ] `bunx biome check` exits 0
- [ ] `bun run build` exits 0
- [ ] `dist/blog/tags/<tag>/index.html` と `dist/works/tags/<tag>/index.html` が各タグ分生成される
- [ ] `grep -rn "?tag=" src/pages/` が空（クエリ URL を全廃）
- [ ] 生成された詳細ページのタグリンクが実在するタグページを指す（リンク切れなし）
- [ ] In-scope 以外が未変更（`git status`）
- [ ] `plans/README.md` 更新

## STOP conditions

- `BlogList` / works カードコンポーネントの props がタグページから渡せる形と大きく異なり、流用に大改修が必要 → 報告。
- 日本語タグの URL エンコードで `getStaticPaths` の params とリンク先が一致せずリンク切れになる → 報告（エンコード方針の確認が必要）。
- works の schema に `tags` が無くなっている（`content/config.ts` がドリフト）→ 報告。

## Maintenance notes

- 新タグは記事/作品に付けるだけで自動的にページが増える。
- 一覧ページの `?tag=` クライアントフィルタは残置（UX として併存）。将来一覧の絞り込みを廃止する場合はこのタグページに一本化できる。
- レビュアーは「クエリ URL の全廃」と「リンク切れ無し」を重点確認。
