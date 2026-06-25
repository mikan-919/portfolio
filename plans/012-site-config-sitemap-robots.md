# Plan 012: `site` を設定し sitemap.xml と robots.txt を配信する

> **Executor instructions**: このプランを順番に実行すること。各ステップの検証コマンドを実行し、期待結果を確認してから次へ進む。「STOP conditions」に該当したら改善せず報告すること。完了したら `plans/README.md` の該当行を更新する（レビュアーから index は自分が管理すると言われた場合を除く）。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- astro.config.ts src/layouts/Layout.astro src/pages/blog/rss.xml.ts public/`
> 上記いずれかが変更されていたら「Current state」の抜粋と現コードを突き合わせ、不一致なら STOP condition として扱う。

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction (SEO 基盤)
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

`astro.config.ts` に `site` が未設定のため、OG 画像 URL（`Layout.astro`）と RSS（`rss.xml.ts`）の絶対 URL は `Astro.site ?? Astro.url` のフォールバックに依存し、ビルド/配信環境次第で不安定になる。さらに `@astrojs/sitemap` 未導入・`public/robots.txt` 不在のため、検索エンジンにサイト構造を提示できていない。`site` 設定 + sitemap + robots を入れると、OG/RSS の絶対 URL が確定し、クロール性が上がる。以降の SEO 施策（Plan 013・014）の前提となる土台。

## Current state

- `astro.config.ts` — Astro 設定。`defineConfig({...})` に `site` キーが**ない**。末尾付近:
  ```ts
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  integrations: [solidJs()],
  adapter: cloudflare({ imageService: 'passthrough' }),
  ```
- `src/layouts/Layout.astro:34` 付近 — OG 画像 URL を `new URL(ogImage, Astro.site ?? Astro.url).href` で生成。`Astro.site` が設定されればこのフォールバックが本来の絶対 URL になる（コード変更は不要）。
- `src/pages/blog/rss.xml.ts` — `site: context.site ?? context.url.origin`。同上、コード変更不要。
- `public/` の中身は `.assetsignore` と `favicon.svg` のみ（`robots.txt` なし）。
- **デプロイ先**: README より Cloudflare Pages。本番ドメインが不明なら STOP condition 参照。

### 規約

- import 順・フォーマットは Biome 管理（`biome.json`）。設定追加後に `bunx biome check` で確認。
- `astro.config.ts` は import を上部、`defineConfig` 呼び出し1つ、`export default config` の形を維持する。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Typecheck | `bun run astro check` | 0 errors            |
| Lint      | `bunx biome check`    | exit 0              |
| Build     | `bun run build`       | exit 0、`dist/sitemap-index.xml` 生成 |

## Scope

**In scope**:
- `astro.config.ts`（`site` 追加、`@astrojs/sitemap` integration 追加）
- `package.json`（`@astrojs/sitemap` を dependencies に追加。`bun add` が自動更新）
- `public/robots.txt`（新規作成）

**Out of scope**（変更禁止）:
- `src/layouts/Layout.astro` — `site` 設定で自動的に正しい絶対 URL になるため触らない。
- `src/pages/blog/rss.xml.ts` — 同上。
- 既存のフォント・adapter 設定。

## Git workflow

- Branch: `advisor/012-site-config-sitemap`
- コミットメッセージ規約: conventional commit（type のみ英語、説明は日本語）。例: `git log` の `feat: ブログに RSS フィードを追加`。
- push / PR はオペレーターの指示があるまで行わない。

## Steps

### Step 1: 本番 URL を確定する

本番ドメインを確定する。`wrangler.toml` / `wrangler.jsonc` / Cloudflare Pages の設定、または README・既存デプロイ URL から探す。見つからなければ STOP（下記 STOP conditions 参照）。以降このプランでは `https://example.com` をプレースホルダとして使う — **実際の確定ドメインに置き換えること**。

**Verify**: `grep -rn "site" astro.config.ts` → まだ一致なし（この時点では未追加）

### Step 2: `@astrojs/sitemap` を追加する

```
bun add @astrojs/sitemap
```

**Verify**: `grep '@astrojs/sitemap' package.json` → dependencies に出力される

### Step 3: `astro.config.ts` に `site` と sitemap integration を追加する

- ファイル上部に `import sitemap from '@astrojs/sitemap'` を追加（import 順は Biome に従う）。
- `defineConfig` の第一階層に `site: 'https://example.com',`（Step 1 の確定ドメイン）を追加。
- `integrations: [solidJs()]` を `integrations: [solidJs(), sitemap()]` にする。

**Verify**: `bun run astro check` → 0 errors かつ `grep -n "site:" astro.config.ts` が1件

### Step 4: `public/robots.txt` を作成する

内容（`Sitemap` 行は Step 1 の確定ドメイン）:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

**Verify**: `cat public/robots.txt` → 上記内容

### Step 5: ビルドして成果物を確認する

```
bun run build
```

**Verify**: exit 0。`ls dist/sitemap-index.xml dist/sitemap-0.xml` が両方存在し、`grep -c "https://example.com" dist/sitemap-0.xml` が1以上。`grep "og:image" dist/index.html` の `content` が `https://example.com/...` の絶対 URL になっている。

## Done criteria

- [ ] `bun run astro check` exits 0
- [ ] `bunx biome check` exits 0
- [ ] `bun run build` exits 0、`dist/sitemap-index.xml` と `dist/sitemap-0.xml` が生成される
- [ ] `dist/index.html` の `og:image` が確定ドメインの絶対 URL
- [ ] `public/robots.txt` が存在し `Sitemap:` 行を含む
- [ ] In-scope 以外のファイルが変更されていない（`git status`）
- [ ] `plans/README.md` のステータス行更新

## STOP conditions

報告して停止（改善しない）:

- 本番ドメインが `wrangler*`・README・既存デプロイ設定から確定できない → どのドメインを使うか確認が必要。
- `astro.config.ts` の構造が「Current state」の抜粋と大きく異なる。
- `bun run build` が sitemap を生成しない、またはフォント/GitHub API 取得でネットワークエラーになり完走しない（ネットワーク制約の可能性 → 報告）。

## Maintenance notes

- 新しいトップレベルページを追加したら sitemap は自動で含む（`getStaticPaths` 経由の動的ページも含まれる）。除外したいページが出たら `sitemap({ filter })` を使う。
- ドメイン変更時は `astro.config.ts` の `site` と `public/robots.txt` の両方を更新すること。
- レビュアーは `og:image` と RSS の `link` が確定ドメインの絶対 URL になっているかを確認する。
