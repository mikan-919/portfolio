# Plan 004: 外部リンクに rel="noopener noreferrer" を追加する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/components/Header.astro src/components/Footer.astro src/components/sections/about/Github.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`target="_blank"` で開く外部リンクに `rel="noopener noreferrer"` がないと、開かれた新しいタブから元のページの `window.opener` にアクセスできる（tabnapping 攻撃）。また、`noreferrer` がないと HTTP `Referer` ヘッダーで訪問元 URL が外部サイトに漏れる。個人ポートフォリオとして影響は小さいが、対処は1属性追加で済む。

## Current state

**関連ファイル:**
- `src/components/Header.astro` — Twitter リンク（target="_blank"、rel なし）
- `src/components/Footer.astro` — Twitter、GitHub、Zenn リンク（target="_blank"、rel なし）
- `src/components/sections/about/Github.astro` — GitHub プロフィールリンク（target="_blank"、rel なし）

**Header.astro の現状（外部リンク部分）:**
```astro
<a
  href="https://twitter.com/mikan_919_main"
  target="_blank"
  class="text-sm border border-lp-border ..."
>
  Contact
</a>
```

**Footer.astro の現状（外部リンク部分、抜粋）:**
```astro
<a href="https://twitter.com/mikan_919_main" target="_blank" class="w-full ...">
  メールを送る
</a>
<a href="https://github.com/mikan-919" target="_blank" class="flex-1 ...">GitHub</a>
<a href="https://twitter.com/mikan_919_main" target="_blank" class="flex-1 ...">X / Twitter</a>
<a href="https://zenn.dev" target="_blank" class="flex-1 ...">Zenn</a>
```

**Github.astro の現状（外部リンク部分）:**
```astro
<a
    href={`https://github.com/${GITHUB_USERNAME}`}
    target="_blank"
    class="inline-flex items-center ..."
>
    @{GITHUB_USERNAME} on GitHub →
</a>
```

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/sections/about/Github.astro`

**Out of scope:**
- その他のコンポーネント（他に `target="_blank"` があれば Step 3 で検出して追加する）

## Git workflow

- Branch: `fix/external-link-security`
- Commit message 例: `外部リンクに rel="noopener noreferrer" を追加`

## Steps

### Step 1: Header.astro の外部リンクを修正する

`src/components/Header.astro` の Twitter リンクに `rel="noopener noreferrer"` を追加する:

**Before:**
```astro
<a
  href="https://twitter.com/mikan_919_main"
  target="_blank"
  class="..."
>
```

**After:**
```astro
<a
  href="https://twitter.com/mikan_919_main"
  target="_blank"
  rel="noopener noreferrer"
  class="..."
>
```

**Verify**: `grep -A2 'target="_blank"' src/components/Header.astro | grep -c 'rel="noopener noreferrer"'` → `1`

### Step 2: Footer.astro の外部リンクをすべて修正する

`src/components/Footer.astro` の `target="_blank"` を持つ4つのリンク全てに `rel="noopener noreferrer"` を追加する。

**Verify**: `grep -c 'rel="noopener noreferrer"' src/components/Footer.astro` → `4`（Astro Built with リンクも含めて全外部リンクの数と一致すること）

### Step 3: Github.astro の外部リンクを修正する

`src/components/sections/about/Github.astro` の GitHub リンクに追加する。

**Verify**: `grep 'rel="noopener noreferrer"' src/components/sections/about/Github.astro` → 1行表示

### Step 4: スコープ外の target="_blank" を確認する

```sh
grep -rn 'target="_blank"' src/ | grep -v 'rel="noopener'
```

→ 出力があった場合、その行にも `rel="noopener noreferrer"` を追加して修正する（スコープ拡張として記録すること）。

### Step 5: ビルド確認

**Verify**: `bun run build` → exit 0

## Test plan

テストスイートなし。確認:
```sh
grep -rn 'target="_blank"' src/ | grep -v 'rel="noopener'
```
→ 0 件

## Done criteria

- [ ] `grep -rn 'target="_blank"' src/ | grep -v 'rel="noopener'` が 0 件
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- Step 4 で発見された追加ファイルの数が多く、スコープが大幅に広がる場合は報告すること

## Maintenance notes

- 将来 `target="_blank"` のリンクを追加する際は、必ず `rel="noopener noreferrer"` をセットで記述すること。
- Biome には `useExternalLinkTarget` というルールがあり、これを有効にすると自動検出できる（このプランのスコープ外）。
