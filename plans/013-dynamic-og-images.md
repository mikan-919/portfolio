# Plan 013: 記事・作品ごとに動的 OG 画像を生成する

> **Executor instructions**: このプランを順番に実行すること。各ステップの検証コマンドを実行し、期待結果を確認してから次へ進む。「STOP conditions」に該当したら改善せず報告すること。完了したら `plans/README.md` の該当行を更新する。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- src/layouts/Layout.astro "src/pages/blog/[...slug]/index.astro" "src/pages/works/[...slug]/index.astro"`
> 変更があれば「Current state」抜粋と現コードを突き合わせ、不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/012-site-config-sitemap-robots.md（絶対 URL が前提）
- **Category**: direction（共有訴求）
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

現状、全ページの OG 画像は `Layout.astro` の `ogImage = '/og-default.png'` 固定で、しかもそのファイルは `public/` に存在しない（`ls public/` は `favicon.svg` と `.assetsignore` のみ）。記事・作品が SNS で共有されてもタイトル無しの同一画像（実体は 404）になる。記事タイトルを焼き込んだ OG 画像を静的生成すれば、共有時のクリック率が上がる。ポートフォリオは「見てもらう」のが目的なのでレバレッジが高い。

## Current state

- `src/layouts/Layout.astro` — `Props` は `{ title?, description?, ogImage? }`。`ogImage` のデフォルトが `/og-default.png`。OG/Twitter の image は `new URL(ogImage, Astro.site ?? Astro.url).href`。
  ```ts
  ogImage = '/og-default.png',
  ```
  ```html
  <meta property="og:image" content={new URL(ogImage, Astro.site ?? Astro.url).href} />
  <meta name="twitter:image" content={new URL(ogImage, Astro.site ?? Astro.url).href} />
  ```
- `src/pages/blog/[...slug]/index.astro` — `getStaticPaths` で `entry`（`CollectionEntry<'articles'>`）を props 化。`<Layout title={...} description={...}>` を呼ぶが `ogImage` は渡していない。記事は `entry.data.title`, `entry.data.date` を持つ。
- `src/pages/works/[...slug]/index.astro` — 同構造（`entry`: `CollectionEntry<'works'>`、`prerender = true`）。
- `public/` に OG 用画像なし。`og:image` は現状デッドリンク。

### 規約・スタック

- フォント: ローカル woff2 が `src/assets/fonts/`（`UDEVGothicHSLG-Regular.woff2` 等）にある。OG 生成にはこの woff2 を再利用できる（日本語タイトル対応に必須）。
- TypeScript strict、シングルクォート、セミコロン無し。
- アイコン等の動的生成エンドポイントは未使用。OG 生成は Astro の `getStaticPaths` を持つ `.ts`/`.png.ts` エンドポイントで行う。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Typecheck | `bun run astro check` | 0 errors            |
| Lint      | `bunx biome check`    | exit 0              |
| Build     | `bun run build`       | exit 0、各記事/作品の OG png が `dist/` に生成 |

## Suggested executor toolkit

- 不慣れな場合は Context7 で `astro` の「OG image generation」「endpoint getStaticPaths」を確認。
- ライブラリは Satori（`satori` + `@resvg/resvg-js`）の組み合わせが Astro 静的サイトの定番。日本語フォント埋め込みのため Step 1 で woff2 → 必要なら ttf を用意する点に注意（Satori は woff/ttf を受け付けるが woff2 は不可なので、`UDEVGothic` の ttf を別途用意するか、woff2 をデコードする必要がある）。**ここが最大の落とし穴**なので Step 1 で必ず検証する。

## Scope

**In scope**:
- `src/pages/og/[...route].png.ts`（新規、OG 画像生成エンドポイント。命名は実装に合わせてよい）
- `src/lib/og.ts`（新規、Satori テンプレートとフォント読込のヘルパ）
- `src/pages/blog/[...slug]/index.astro`（`ogImage` を渡すよう1行追加）
- `src/pages/works/[...slug]/index.astro`（同上）
- `package.json`（`satori`, `@resvg/resvg-js` 追加）

**Out of scope**（変更禁止）:
- `src/layouts/Layout.astro` の OG メタタグ構造 — `ogImage` prop を渡すだけで足り、Layout 側は変えない。
- トップ/一覧ページの OG（デフォルト画像の扱いは別途。本プランは記事・作品の個別ページのみ）。
- デザインシステムの色トークン定義（OG テンプレ内でハードコードして可。`global.css` は触らない）。

## Git workflow

- Branch: `advisor/013-dynamic-og-images`
- conventional commit（type 英語・説明日本語）。例: `feat: 記事ごとの動的 OG 画像を追加`
- push / PR は指示があるまで行わない。

## Steps

### Step 1: フォント埋め込みの実現可否を先に検証する（最重要）

`satori` と `@resvg/resvg-js` を追加し、`UDEVGothic` フォントで日本語文字列を Satori に渡して SVG→PNG を1枚生成できるか最小スクリプトで確認する。woff2 が直接使えない場合は次のいずれかで解決する: (a) ttf 版フォントを `src/assets/fonts/` に追加、(b) `Inter` 等のラテン+別途日本語フォントを用意。**日本語が豆腐（□）になる場合は STOP して報告**。

```
bun add satori @resvg/resvg-js
```

**Verify**: 最小スクリプトで日本語タイトルを含む PNG が1枚生成され、文字化けしない。

### Step 2: OG テンプレヘルパ `src/lib/og.ts` を作る

`title: string`（必要なら `date` も）を受け取り、Satori で SVG を生成 → resvg で PNG(`Uint8Array`/`Buffer`) を返す関数 `renderOgImage(opts)` を実装。サイズは 1200×630。背景・文字色はサイト調（落ち着いた背景＋大きなタイトル＋小さく "Portfoliooo"）。フォントは Step 1 で確定したものを読み込む。

**Verify**: `bun run astro check` → 0 errors

### Step 3: 生成エンドポイント `src/pages/og/[...route].png.ts` を作る

`getStaticPaths` で `getCollection('articles')` と `getCollection('works')` を列挙し、各 entry につき1ルート（例: `og/blog/<id>.png`, `og/works/<id>.png`）を生成。各ルートで `renderOgImage({ title: entry.data.title })` を呼び、`new Response(png, { headers: { 'Content-Type': 'image/png' } })` を返す。

**Verify**: `bun run build` 後、`ls dist/og/blog/` と `ls dist/og/works/` に各コンテンツ分の `.png` が存在。

### Step 4: 記事・作品ページから `ogImage` を渡す

- `src/pages/blog/[...slug]/index.astro` の `<Layout title=... description=...>` に `ogImage={`/og/blog/${entry.id}.png`}` を追加。
- `src/pages/works/[...slug]/index.astro` の `<Layout ...>` に `ogImage={`/og/works/${entry.id}.png`}` を追加。
- 実際のエンドポイントのパス形式に合わせること（Step 3 の命名と一致させる）。

**Verify**: `bun run build` 後、`grep "og:image" dist/blog/<任意の記事id>/index.html` の `content` が確定ドメイン + `/og/blog/<id>.png` の絶対 URL（Plan 012 の `site` 設定が効いていること）。

## Test plan

- このリポジトリにテストランナーは未導入。テストは追加しない。
- 検証はビルド成果物の grep / 目視で行う（Done criteria 参照）。
- 1枚は実際に画像ビューアで開き、日本語タイトルが読めることを目視確認する。

## Done criteria

- [ ] `bun run astro check` exits 0
- [ ] `bunx biome check` exits 0
- [ ] `bun run build` exits 0
- [ ] `dist/og/blog/*.png` と `dist/og/works/*.png` がコンテンツ数分生成される
- [ ] 記事ページ HTML の `og:image` が `/og/blog/<id>.png` の絶対 URL を指す
- [ ] 生成 PNG の日本語タイトルが文字化けしない（目視）
- [ ] In-scope 以外が未変更（`git status`）
- [ ] `plans/README.md` 更新

## STOP conditions

- Step 1 で日本語フォントを Satori に埋め込めず豆腐になる（フォント形式の問題）→ どのフォントを使うか相談。
- ビルド時間が極端に増える（記事数 × 画像生成）。現状コンテンツ数は少ないが、明らかな問題があれば報告。
- `@resvg/resvg-js`（ネイティブバイナリ）が Cloudflare Pages のビルド環境で動かない兆候 → 報告。`output: 'static'` なのでビルド時生成であり実行時は不要だが、ビルド環境での動作を確認すること。

## Maintenance notes

- 記事/作品を追加すれば OG 画像は自動生成される（`getStaticPaths` 経由）。
- OG テンプレの色をサイトのデザイントークンと揃えたい場合は `src/lib/og.ts` を編集（`global.css` のトークンは Satori からは参照できないのでヘルパ内に値を持つ）。
- フォントを差し替える場合は `src/lib/og.ts` の読込パスのみ変更。
- レビュアーは生成画像の文字化け・はみ出し（長いタイトルの折返し/省略）を確認する。
