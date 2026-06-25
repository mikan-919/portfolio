# Plan 008: devDependencies の誤分類を修正する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- package.json`
> If the file changed since this plan was written, compare "Current state" against the live file before proceeding.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`@astrojs/check`・`@biomejs/biome`・`@tailwindcss/vite`・`typescript` は実行時には不要なビルドツールだが `dependencies` に入っている。Cloudflare Pages や他の CI 環境でプロダクションインストール（`--omit=dev`）を行うと、これらが含まれてインストール時間とサイズが増える。`bun` はデフォルトで全依存をインストールするため現状は動いているが、分類は正すべき。

## Current state

**`package.json` の現状 `dependencies`（抜粋）:**
```json
"dependencies": {
    "@astrojs/check": "^0.9.9",
    "@astrojs/cloudflare": "^12.6.13",
    "@astrojs/solid-js": "^5.1.3",
    "@biomejs/biome": "^2.5.1",
    "@lucide/astro": "^0.554.0",
    "@solid-primitives/resize-observer": "^2.1.5",
    "@tailwindcss/vite": "^4.3.1",
    "astro": "^5.18.2",
    "simple-icons": "^16.24.0",
    "simple-icons-astro": "^16.1.0",
    "solid-js": "^1.9.13",
    "tailwindcss": "^4.3.1",
    "typescript": "^5.9.3"
},
"devDependencies": {
    "@commitlint/cli": "^20.5.3",
    "@commitlint/config-conventional": "^20.5.3",
    "@tailwindcss/typography": "^0.5.20",
    "husky": "^9.1.7"
}
```

**`devDependencies` へ移動すべきパッケージ（ビルドツール・型チェック）:**
- `@astrojs/check` — `astro check` コマンド用、実行時不要
- `@biomejs/biome` — linter/formatter、実行時不要
- `typescript` — 型チェック、実行時不要

**`dependencies` に残すもの（実行時・ビルドパイプラインに必要）:**
- `astro` — Astro フレームワーク本体（ビルドランナーとして必要）
- `@astrojs/cloudflare` — Cloudflare アダプター（ビルド時に必要）
- `@astrojs/solid-js` — SolidJS インテグレーション
- `@tailwindcss/vite` — Vite プラグインとしてビルドに組み込まれる（`astro.config.*` に登録済み）→ `dependencies` に残す
- `tailwindcss` — 同上
- `solid-js` — クライアントバンドルに含まれる
- その他ランタイム依存

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Install    | `bun install`         | exit 0              |
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `package.json`

**Out of scope:**
- `bun.lockb` — `bun install` 後に自動更新される、手動で触らない
- その他すべてのファイル

## Git workflow

- Branch: `chore/fix-dev-dependencies`
- Commit message 例: `devDependencies の誤分類を修正`

## Steps

### Step 1: package.json を修正する

以下のパッケージを `dependencies` から `devDependencies` に移動する:
- `@astrojs/check`
- `@biomejs/biome`
- `typescript`

`devDependencies` のアルファベット順に挿入する。移動後の `devDependencies`:
```json
"devDependencies": {
    "@astrojs/check": "^0.9.9",
    "@biomejs/biome": "^2.5.1",
    "@commitlint/cli": "^20.5.3",
    "@commitlint/config-conventional": "^20.5.3",
    "@tailwindcss/typography": "^0.5.20",
    "husky": "^9.1.7",
    "typescript": "^5.9.3"
}
```

**Verify**: `grep -A2 '"@astrojs/check"' package.json` → `devDependencies` セクション内に表示される

### Step 2: 再インストールして整合性確認

```sh
bun install
```
→ exit 0

### Step 3: ビルドと型チェックの確認

```sh
bun run astro check && bun run build
```
→ 両方 exit 0

## Done criteria

- [ ] `@astrojs/check`・`@biomejs/biome`・`typescript` が `devDependencies` にある
- [ ] 上記3つが `dependencies` にない（`grep '"@astrojs/check"' package.json` が `devDependencies` ブロックの中にある）
- [ ] `bun install` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `bun run build` が移動後に失敗する（予期しない実行時依存の可能性）

## Maintenance notes

- 新パッケージを追加する際は、ビルド/開発専用ツールは `bun add -D` で追加すること。
