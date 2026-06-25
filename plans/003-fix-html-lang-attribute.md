# Plan 003: HTML の lang 属性を ja に修正する

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
- **Depends on**: plans/002-add-seo-meta-tags.md（同じファイルを触るため、002 の後に実行すること）
- **Category**: bug
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`src/layouts/Layout.astro` の `<html lang="en">` はコンテンツが主に日本語であるにもかかわらず英語を宣言している。スクリーンリーダーはこの属性を見て読み上げ言語を決定するため、視覚障害者向けのアクセシビリティを損なう。検索エンジンの言語判定にも影響する。修正は1行。

## Current state

**関連ファイル:**
- `src/layouts/Layout.astro` — 全ページ共通レイアウト

**現状:**
```astro
<html lang="en">
```
（`src/layouts/Layout.astro` の `<head>` タグの直前）

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/layouts/Layout.astro`（1行のみ）

**Out of scope:**
- その他すべてのファイル

## Git workflow

- Branch: `fix/html-lang-ja`（または 002 と同じブランチにまとめてもよい）
- Commit message 例: `html の lang 属性を ja に修正`

## Steps

### Step 1: lang 属性を変更する

`src/layouts/Layout.astro` 内の:

```astro
<html lang="en">
```

を:

```astro
<html lang="ja">
```

に変更する。変更箇所は1行のみ。

**Verify**: `grep -n 'lang=' src/layouts/Layout.astro` → `lang="ja"` が含まれる行が表示され、`lang="en"` は0件

### Step 2: ビルド確認

**Verify**: `bun run build` → exit 0

ビルド後: `grep -l 'lang="ja"' dist/index.html` → `dist/index.html` が表示される

## Test plan

テストスイートなし。手動確認のみ:
- `bun run build` 後に `dist/index.html` を開き `lang="ja"` を確認

## Done criteria

- [ ] `grep -rn 'lang="en"' src/layouts/` が 0 件
- [ ] `grep -n 'lang="ja"' src/layouts/Layout.astro` が 1 件
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `src/layouts/Layout.astro` が複数の `<html>` タグを持つ（通常あり得ないが、ドリフトの可能性）

## Maintenance notes

- 英語コンテンツ専用ページ（例: 将来的な英語版）が追加される場合、そのページ用のレイアウトを別途作成し `lang="en"` を使う設計にすること。
