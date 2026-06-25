# Plan 017 (SPIKE): 英語版（i18n）の設計を検証する

> **Executor instructions**: これは**設計スパイク**。ビルドして回す本実装ではなく、影響範囲の調査と移行設計の確定が成果物。コード変更は最小の検証に留める。「STOP conditions」該当時は報告。完了後 `plans/README.md` の行を更新。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- astro.config.ts src/content/config.ts src/pages/ src/components/`

## Status

- **Priority**: P3
- **Effort**: L（本実装。スパイクは S〜M）
- **Risk**: MED（影響範囲が広い）
- **Depends on**: none
- **Category**: direction（spike）
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

ポートフォリオの目的はリーチ。海外（採用・OSS コミュニティ）にも届けるなら英語版が効く。一方で Astro の i18n ルーティング導入は、URL 設計・content collections の locale 分割・全 UI 文言の外部化・OG/RSS/sitemap の locale 対応に波及し、影響範囲が広い。需要が固まる前に作り込むと翻訳運用が恒常コストになる。よって**まず影響範囲を棚卸しし、移行設計と工数を確定する**スパイクに留め、本実装は需要確認後に判断する。

## Current state

- `astro.config.ts` — `i18n` 設定なし。`output: 'static'`、Cloudflare adapter。
- 全ページ HTML は `src/layouts/Layout.astro` で `<html lang="ja">` 固定。UI 文言（"ALL ARTICLES"・"Back to Blog" 等）と日本語コピー（`Layout.astro` の description デフォルト等）がコンポーネント内にハードコードされている。
- コンテンツは content collections（`works` / `articles` / `techStack` / `timeline`）で、いずれも**単一言語前提のスキーマ**（`content/config.ts`）。
- ルーティングは `src/pages/` 直下（`/`, `/works`, `/about`, `/blog` …）にロケール接頭辞なし。
- RSS（`rss.xml.ts`）は `<language>ja</language>` 固定。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Typecheck | `bun run astro check` | 0 errors            |
| Build     | `bun run build`       | exit 0              |

## Suggested executor toolkit

- Context7 で Astro の `i18n` ルーティング（`i18n` config、`defaultLocale` / `locales` / `routing`）と、content collections の多言語パターン（`i18n` ローダ分割 or frontmatter に `lang` フィールド）を確認。

## Scope

**In scope（調査・設計のみ）**:
- 影響範囲の棚卸しドキュメントを書く（このプラン内の「成果物」セクションに沿って報告、または `plans/` 配下に短い設計メモを追記してよい）。
- 1ページ（例 `/about`）だけのロケール分割 POC を作って実現性を確認してよい（本マージはしない）。

**Out of scope**:
- 全ページ・全コンテンツの翻訳と本移行（採用決定後の大型プラン）。
- 既存日本語ページの URL 変更（本実装まで現状維持）。

## Steps

### Step 1: ハードコード文言の棚卸し

UI 文言と日本語コピーがどこに散っているかを洗う。`src/components/` と `src/pages/`、`src/layouts/Layout.astro` を対象に、翻訳対象文字列のおおよその箇所数を数える。

**Verify**: `grep -rIl "[ぁ-んァ-ヶ一-龠]" src/components src/pages src/layouts | wc -l`（日本語を含むソースファイル数）を記録。

### Step 2: ルーティング方式の決定

`defaultLocale: 'ja'`（接頭辞なし）＋ `en` を `/en/...` に置く `prefixDefaultLocale: false` 方式を第一候補として、URL 設計と既存日本語 URL の後方互換（リダイレクト不要か）を確認。

**Verify**: 方式とそのトレードオフを文書化。

### Step 3: content collections の多言語化方式の決定

記事/作品を (a) `lang` frontmatter フィールド＋フィルタ、(b) ロケール別ディレクトリ、のどちらで持つかを比較し、`content/config.ts` への影響を見積もる。RSS/sitemap/OG の locale 対応も列挙。

**Verify**: 方式と `content/config.ts` 改修範囲を文書化。

### Step 4: 1ページ POC（任意）と最終報告

`/about` か `/en/about` の片方だけで i18n ルーティングが成立するか最小 POC で確認（任意）。最後に以下を報告: 影響ファイル数、推奨方式、本実装の段階分け（ルーティング → UI 文言外部化 → コンテンツ翻訳）、各段階の工数、運用コスト、推奨可否。

**Verify**: 報告が存在。POC を残さないなら revert。

## Done criteria

- [ ] 翻訳対象文言の所在と規模を棚卸しした
- [ ] ルーティング方式・コンテンツ多言語化方式を決定し文書化した
- [ ] RSS/sitemap/OG/`<html lang>` の locale 対応箇所を列挙した
- [ ] 本実装の段階分けと工数・運用コストを報告した
- [ ] POC を残さない場合 revert した
- [ ] `plans/README.md` 更新

## STOP conditions

- i18n 導入が既存 URL のリダイレクト必須を招き、Cloudflare Pages での実現に追加設定が要る → 報告。
- コンテンツ量・翻訳運用の見通しが立たず「需要確認が先」と判断 → その旨を結論として報告（これは正常な着地）。

## Maintenance notes

- これは設計スパイク。本実装は規模的に複数プランに分割すべき（ルーティング基盤 / UI 文言 / コンテンツ）。
- 翻訳運用（誰がいつ翻訳するか）の合意が無いまま基盤だけ作ると未訳ページが負債になる。本実装の前提条件として明記すること。
