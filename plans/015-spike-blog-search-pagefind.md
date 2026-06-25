# Plan 015 (SPIKE): ブログ全文検索（Pagefind）の導入可否を検証する

> **Executor instructions**: これは**スパイク（調査・最小検証）プラン**。本実装を全部やるのではなく、Step に沿って技術検証を行い、最後に「採用判断と本実装の見積もり」を報告すること。コード変更は最小 POC に留める。「STOP conditions」該当時は報告。完了後 `plans/README.md` の行を更新。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- package.json astro.config.ts src/pages/blog/`

## Status

- **Priority**: P3
- **Effort**: M（スパイクは S〜M）
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction（spike）
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

ブログは記事が増える前提の機能（一覧・タグ・RSS が既にある）。現状は検索手段が無く、記事が増えると回遊性が落ちる。Pagefind は静的サイト（`output: 'static'`）にビルド後のインデックスを生成し、ランタイム/サーバ不要でクライアント検索を提供する定番。記事 2 本の今は体感価値が低いので、**今は「採用判断＋本実装手順の確定」までをスパイクで行い、本実装は記事が増えてから**にするのが妥当。

## Current state

- `astro.config.ts` — `output: 'static'`、adapter は Cloudflare。ビルドは `bun run build`（成果物 `dist/`）。
- ブログ: `src/pages/blog/index.astro`（一覧、`BlogArchive`）、`src/pages/blog/[...slug]/index.astro`（詳細）。記事本文は `render(entry)` で出力。
- 検索 UI は存在しない。
- Pagefind はビルド後の HTML をクロールしてインデックス化するため、検索対象にしたい本文に安定したセレクタ（例 `data-pagefind-body`）が必要。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Build     | `bun run build`       | exit 0              |
| Pagefind  | `bunx pagefind --site dist`（検証用） | `dist/pagefind/` 生成 |

## Suggested executor toolkit

- Context7 で `pagefind` および「Astro Pagefind integration」を確認。`astro-pagefind` という統合パッケージの有無と、素の `pagefind` CLI を `build` 後に走らせる方式の比較を行う。
- Cloudflare Pages のビルドコマンドに後処理（pagefind CLI）を差し込めるか（`package.json` の `build` スクリプト連結）を確認。

## Scope

**In scope（POC のみ）**:
- `package.json` の `build` スクリプトに pagefind を一時的に連結して検証してよい（検証後、本採用しないなら戻す）。
- 検証用の最小 UI を `src/pages/blog/` 配下に作ってよいが、**本番マージは別途**。

**Out of scope**:
- 検索 UI の本デザイン実装（採用決定後に別プランで行う）。
- 既存ブログ一覧・タグ・RSS の挙動変更。

## Steps

### Step 1: ビルド後インデックス生成を検証

`bun run build` 後に `bunx pagefind --site dist` を実行し、`dist/pagefind/` が生成されるか確認。記事詳細 HTML がインデックスに含まれるか（記事タイトル語での検索ヒット）を pagefind の出力で確認。

**Verify**: `ls dist/pagefind/pagefind.js` が存在。

### Step 2: 検索対象スコープの確認

記事本文だけを検索対象にするには `src/pages/blog/[...slug]/index.astro` の `<Content />` を囲む要素に `data-pagefind-body` を付ける必要があるかを検証。ヘッダ/フッタが混入しないか確認。

**Verify**: 検索結果に記事本文の語がヒットし、共通ヘッダ/フッタの語が主結果を汚染しない。

### Step 3: Cloudflare Pages ビルドへの組込み可否

`package.json` の `build` を `astro build && pagefind --site dist` 相当にしてローカルで完走するか、Cloudflare Pages のビルド環境で pagefind バイナリが動くか（ネイティブ依存の懸念）を確認。

**Verify**: `bun run build`（連結後）が exit 0 で `dist/pagefind/` を含む。

### Step 4: 判断と本実装見積もりを報告

以下を `plans/README.md` の本プラン行のメモ、または別途の短い報告にまとめる:
- 採用是非（記事数の閾値の目安つき）
- 採用する場合の本実装ステップ（UI 配置・`data-pagefind-body` 付与箇所・ビルド連結）と工数
- 不採用/保留なら理由

**Verify**: 報告が存在し、`package.json` の一時変更を戻したか明記。

## Done criteria

- [ ] `dist/pagefind/` がローカル検証で生成できることを確認した
- [ ] Cloudflare ビルド環境での動作可否を確認/報告した
- [ ] 採用判断と本実装見積もりを報告した
- [ ] POC のための一時変更を戻した（または本採用として別プラン化する旨を記載）
- [ ] `plans/README.md` 更新

## STOP conditions

- pagefind バイナリが Cloudflare Pages ビルド環境で動かない兆候 → 代替（クライアント側 fuse.js 等）の検討が必要、報告。
- インデックスサイズや検索 UX が記事数の現状に見合わない → 「記事 N 本まで保留」と結論して報告。

## Maintenance notes

- 本スパイクは判断材料の作成が成果物。コードを残さない方針なら POC 変更は revert する。
- 本実装に進む場合は別プラン（016 以降の採番）として切る。
