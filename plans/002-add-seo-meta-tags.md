# Plan 002: OG / SEO メタタグを追加する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/layouts/Layout.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

現在の `Layout.astro` には `<title>` タグしかなく、`<meta name="description">` も Open Graph タグも存在しない。ポートフォリオとして SNS でシェアされたとき、OG カードが空になる。検索エンジンも description を使えない。`Layout.astro` に props を追加して全ページから渡せるようにする。

## Current state

**関連ファイル:**
- `src/layouts/Layout.astro` — 全ページ共通レイアウト。`title` props のみ受け取る
- `src/pages/index.astro` — トップページ（`<Layout>` を props なしで使用）
- `src/pages/about/index.astro` — `title="Portfoliooo | About"` で使用
- `src/pages/blog/index.astro` — `title="Portfoliooo | Blog"` で使用
- `src/pages/works/index.astro` — `title="Portfoliooo | Works"` で使用
- `src/pages/blog/[...slug]/index.astro` — `title="Portfoliooo | {entry.data.title}"` で使用
- `src/pages/works/[...slug]/index.astro` — `title="Portfoliooo | {entry.data.title}"` で使用

**Layout.astro の現状 `<head>` :**
```astro
<head>
    <ClientRouter />
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title || "Portfoliooo"}</title>
    <Fonts />
</head>
```

**Layout.astro の現状 Props:**
```astro
type Props = {
    title?: string;
};
const { title }: Props = Astro.props;
```

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/layouts/Layout.astro`
- `src/pages/index.astro`
- `src/pages/about/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/works/index.astro`
- `src/pages/blog/[...slug]/index.astro`
- `src/pages/works/[...slug]/index.astro`

**Out of scope:**
- `src/layouts/Fonts.astro` — フォント専用、触らない
- その他コンポーネント

## Git workflow

- Branch: `feat/seo-meta-tags`
- Commit message 例: `SEO・OGメタタグを全ページに追加`

## Steps

### Step 1: Layout.astro の Props を拡張し `<head>` にメタタグを追加する

`src/layouts/Layout.astro` の Props 型と frontmatter を以下のように変更する:

**Before:**
```astro
type Props = {
    title?: string;
};
const { title }: Props = Astro.props;
```

**After:**
```astro
type Props = {
    title?: string
    description?: string
    ogImage?: string
}
const {
    title,
    description = '学生エンジニア・摘果みかんのポートフォリオ。Web開発の制作実績とブログを掲載。',
    ogImage = '/og-default.png',
}: Props = Astro.props
```

`<head>` ブロックを以下に置き換える:

```astro
<head>
    <ClientRouter />
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title || 'Portfoliooo'}</title>
    <meta name="description" content={description} />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title || 'Portfoliooo'} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site ?? Astro.url).href} />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title || 'Portfoliooo'} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, Astro.site ?? Astro.url).href} />
    <Fonts />
</head>
```

**Verify**: `bun run astro check` → exit 0

### Step 2: 各静的ページに description を渡す

各ページの `<Layout>` 呼び出しに `description` props を追加する。

**`src/pages/index.astro`:**
```astro
<Layout description="学生エンジニア・摘果みかんのポートフォリオ。制作実績とブログを掲載。">
```

**`src/pages/about/index.astro`:**
```astro
<Layout title="Portfoliooo | About" description="摘果みかんのプロフィール・学習中の技術・GitHub Activity。">
```

**`src/pages/blog/index.astro`:**
```astro
<Layout title="Portfoliooo | Blog" description="摘果みかんのブログ。日常とプログラミングについて書いています。">
```

**`src/pages/works/index.astro`:**
```astro
<Layout title="Portfoliooo | Works" description="摘果みかんの制作実績一覧。Web サイト・アプリの開発事例。">
```

**Verify**: `bun run astro check` → exit 0

### Step 3: 記事・作品詳細ページに動的 description を渡す

**`src/pages/blog/[...slug]/index.astro`** — frontmatter で `entry` が取得された後:
```astro
<Layout
    title={`Portfoliooo | ${entry.data.title}`}
    description={entry.data.description}
>
```

**`src/pages/works/[...slug]/index.astro`** — frontmatter で `entry` が取得された後:
```astro
<Layout
    title={`Portfoliooo | ${entry.data.title}`}
    description={entry.data.description}
>
```

**Verify**: `bun run astro check` → exit 0

### Step 4: ビルドを実行して OG タグが出力に含まれることを確認する

```sh
bun run build
```

ビルド後:
```sh
grep -l "og:title" dist/**/*.html | head -3
```
→ 1件以上の HTML ファイルが表示されること

## Test plan

テストスイートなし。手動確認:
1. `bun run build && bun run preview`
2. トップページの HTML ソースに `og:title`, `og:description`, `twitter:card` が含まれることを確認
3. 記事詳細ページで description が記事の `description` フィールドと一致することを確認

## Done criteria

- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `grep -r "og:title" dist/ | wc -l` が 1 以上
- [ ] `grep -rn "DOMContentLoaded" src/layouts/Layout.astro` が 0 件（変更対象外のコードが壊れていない）
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `Astro.site` が設定されておらず `new URL(ogImage, Astro.site)` がビルドエラーになる場合 → `Astro.site` を `astro.config.*` の `site` フィールドに設定する必要があるが、それはこのプランのスコープ外。`Astro.url` をフォールバックとして使用しているため通常は問題ない
- 上記の "Current state" のコードと実際のコードが一致しない

## Maintenance notes

- OG 画像（`/og-default.png`）は現時点で存在しない。画像なしで OG タグは機能するが、SNS シェア時にカードに画像が表示されない。別途 `public/og-default.png` を作成することを推奨（このプランのスコープ外）。
- `astro.config.*` に `site: 'https://...'` を追加すると OG 画像の絶対 URL が正確になる（スコープ外）。
- 記事・作品を追加する際は content の frontmatter に `description` フィールドを必ず記載すること（schema で required になっているため、省略するとビルドエラー）。
