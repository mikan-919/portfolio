# Plan 010: ブログに RSS フィードを追加する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- package.json src/pages/`
> If any in-scope file changed, compare before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

ブログを運営しているが、RSS フィードがなく読者がフォローする手段が SNS 経由のみ。`@astrojs/rss` を追加して `/blog/rss.xml` を生成するだけで、RSS リーダーからの購読が可能になる。追加コードは1ファイル40行程度。

## Current state

**関連ファイル:**
- `src/pages/blog/` — ブログ関連ページ群（`index.astro`、`[...slug]/index.astro`）
- `src/content/config.ts` — `articles` コレクション定義（`title`・`description`・`date`・`tags` フィールドあり）
- `package.json` — 現在 `@astrojs/rss` は未インストール

**articles コレクションのスキーマ（`src/content/config.ts` より）:**
```ts
z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string().optional(),
    tags: z.array(z.string()),
    image: image().optional(),
    date: z.date(),
})
```

**`astro.config.*` の `output`:** `'static'`（静的出力）

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Install    | `bun add @astrojs/rss` | exit 0              |
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `package.json`（`@astrojs/rss` 追加）
- `src/pages/blog/rss.xml.ts`（新規作成）
- `src/components/Header.astro`（RSS リンクの `<link>` タグ追加）
- `src/layouts/Layout.astro`（`<head>` に RSS auto-discovery リンク追加）

**Out of scope:**
- `astro.config.*` — RSS に `site` 設定が必要だが、`Astro.site ?? Astro.url` で代替できる。config 変更なし
- その他すべてのファイル

## Git workflow

- Branch: `feat/rss-feed`
- Commit message 例: `ブログに RSS フィードを追加`

## Steps

### Step 1: @astrojs/rss をインストールする

```sh
bun add @astrojs/rss
```

**Verify**: `grep '@astrojs/rss' package.json` → バージョン付きで表示される

### Step 2: src/pages/blog/rss.xml.ts を作成する

以下の内容で `src/pages/blog/rss.xml.ts` を新規作成する:

```ts
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
    const articles = await getCollection('articles')
    const sorted = articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

    return rss({
        title: 'mikan-919 | Blog',
        description: '摘果みかんのブログ。日常とプログラミングについて書いています。',
        site: context.site ?? context.url.origin,
        items: sorted.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            link: `/blog/${post.id}/`,
        })),
        customData: '<language>ja</language>',
    })
}
```

**Verify**: `bun run astro check` → exit 0

### Step 3: Layout.astro に RSS auto-discovery リンクを追加する

`src/layouts/Layout.astro` の `<head>` ブロック内（`<title>` の後など）に以下を追加する:

```astro
<link rel="alternate" type="application/rss+xml" title="mikan-919 Blog RSS" href="/blog/rss.xml" />
```

**Verify**: `grep 'rss+xml' src/layouts/Layout.astro` → 1件表示

### Step 4: ビルドして rss.xml が生成されることを確認する

```sh
bun run build
```

**Verify**:
```sh
ls dist/blog/rss.xml
```
→ ファイルが存在すること

```sh
grep '<title>' dist/blog/rss.xml | head -3
```
→ `<title>mikan-919 | Blog</title>` が含まれること

## Done criteria

- [ ] `src/pages/blog/rss.xml.ts` が存在する
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `dist/blog/rss.xml` が存在する（`ls dist/blog/rss.xml` → ファイル名が表示）
- [ ] `grep 'language' dist/blog/rss.xml` → `<language>ja</language>` が含まれる
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `bun add @astrojs/rss` が Astro バージョンとの互換性エラーで失敗する（その場合バージョンを確認して報告）
- `context.site` が `undefined` でかつ `context.url.origin` も正確な URL にならない場合（`astro.config.*` に `site` フィールドを追加する必要があるが、それはこのプランのスコープ外のため報告すること）

## Maintenance notes

- 記事を追加すると自動的に RSS に含まれる。手動更新不要。
- `astro.config.*` に `site: 'https://your-domain.com'` を設定すると、生成される RSS の `<link>` が絶対 URL になりリーダーとの互換性が向上する（このプランのスコープ外）。
