# Plan 006: Hero の統計値を動的に collections から取得する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/components/sections/root/Hero.astro src/pages/index.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / tech-debt
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`src/components/sections/root/Hero.astro` に "3 Projects"・"12+ Blog Posts"・"2022 Since" がハードコードされている。作品や記事を追加するたびにこのファイルを手動で更新しなければならず、すでに数値がずれている可能性がある。Astro の build 時 data fetching を使って collections から動的に取得するよう変更する。

## Current state

**関連ファイル:**
- `src/components/sections/root/Hero.astro` — Hero セクション（現状：frontmatter なし、静的 HTML のみ）
- `src/pages/index.astro` — トップページ。`works` と `articles` を既に取得して子コンポーネントに渡している

**Hero.astro の現状（stats 部分）:**
```astro
---
---

<div class="w-full bg-lp-bg">
  ...
  <!-- stats row -->
  <div class="mt-9 border-t border-b border-lp-border-subtle py-6 w-full flex justify-center gap-16">
    <div class="flex flex-col items-center gap-1">
      <span class="font-new text-[40px] leading-none text-lp-text">3</span>
      <span class="font-mono text-[11px] text-lp-muted uppercase tracking-[0.06em]">Projects</span>
    </div>
    <div class="w-px bg-lp-border-subtle"></div>
    <div class="flex flex-col items-center gap-1">
      <span class="font-new text-[40px] leading-none text-lp-text">12+</span>
      <span class="font-mono text-[11px] text-lp-muted uppercase tracking-[0.06em]">Blog Posts</span>
    </div>
    <div class="w-px bg-lp-border-subtle"></div>
    <div class="flex flex-col items-center gap-1">
      <span class="font-new text-[40px] leading-none text-lp-text">2022</span>
      <span class="font-mono text-[11px] text-lp-muted uppercase tracking-[0.06em]">Since</span>
    </div>
  </div>
  ...
</div>
```

**`src/pages/index.astro` の現状（frontmatter）:**
```astro
const allWorks = await getCollection('works')
const sortedWorks = sortByDateDescending(allWorks).slice(0, 3)
const allArticles = await getCollection('articles')
const sortedArticles = sortByDateDescending(allArticles).slice(0, 3)
```
`<Hero />` は props を受け取らずに使用されている。

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。他の Astro コンポーネントで props を受け取る例: `src/components/sections/root/Works.astro`（`type Props = WorksListProps`）。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/components/sections/root/Hero.astro`
- `src/pages/index.astro`

**Out of scope:**
- その他のページ・コンポーネント
- "Since" の年（2022）は変更しない — 手動で管理される値であり、collections から算出できない

## Git workflow

- Branch: `feat/hero-dynamic-stats`
- Commit message 例: `Hero の統計値を collections から動的取得に変更`

## Steps

### Step 1: Hero.astro に Props と frontmatter を追加する

`src/components/sections/root/Hero.astro` の frontmatter（`---` ブロック）を以下に変更する:

```astro
---
type Props = {
    projectCount: number
    articleCount: number
}
const { projectCount, articleCount } = Astro.props
---
```

### Step 2: テンプレートの stats 値を動的に変更する

stats row の数値部分を以下のように変更する:

**Projects（Before）:**
```astro
<span class="font-new text-[40px] leading-none text-lp-text">3</span>
```

**Projects（After）:**
```astro
<span class="font-new text-[40px] leading-none text-lp-text">{projectCount}</span>
```

**Blog Posts（Before）:**
```astro
<span class="font-new text-[40px] leading-none text-lp-text">12+</span>
```

**Blog Posts（After）:**
```astro
<span class="font-new text-[40px] leading-none text-lp-text">{articleCount}</span>
```

"2022" の Since 値はそのまま残す。

**Verify**: `grep -n '"12+"' src/components/sections/root/Hero.astro` → 0 件

### Step 3: index.astro から Hero に props を渡す

`src/pages/index.astro` で Hero を使用している箇所を変更する:

**Before:**
```astro
<Hero />
```

**After:**
```astro
<Hero projectCount={allWorks.length} articleCount={allArticles.length} />
```

`allWorks` と `allArticles` はすでに frontmatter で取得されているため追加の fetch は不要。

**Verify**: `bun run astro check` → exit 0

### Step 4: ビルド確認

**Verify**: `bun run build` → exit 0

ビルド後:
```sh
grep -o 'Projects\|Blog Posts' dist/index.html | head -5
```
→ `Projects` と `Blog Posts` が含まれること（数値の正確さはソースで確認）

## Test plan

テストスイートなし。手動確認:
1. `bun run build` 後に `dist/index.html` を確認
2. stats の数値が `works/` と `articles/` 内のファイル数と一致することを確認

## Done criteria

- [ ] `grep -n '"3"' src/components/sections/root/Hero.astro` → stats 関連の行が 0 件（"3" という数値が消えている）
- [ ] `grep -n '"12+"' src/components/sections/root/Hero.astro` → 0 件
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] 変更されたファイルが `Hero.astro` と `index.astro` のみ（`git status` で確認）
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `Hero.astro` のテンプレートが "Current state" の抜粋と大きく異なる（他の stats が追加されているなど）

## Maintenance notes

- 作品や記事を追加すると自動的に統計値が更新される。手動で数値を管理する必要はなくなる。
- "Since" の年（2022）は手動管理のままにしている。変更が必要な場合は `Hero.astro` 直接編集すること。
