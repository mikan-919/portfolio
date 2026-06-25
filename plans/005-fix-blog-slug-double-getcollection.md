# Plan 005: blog/[...slug] の getCollection 二重呼び出しを解消する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/pages/blog/\[...slug\]/index.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf / tech-debt
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`src/pages/blog/[...slug]/index.astro` は `getStaticPaths` 内で `getCollection('articles')` を1回呼び、その後のページ frontmatter でも `getCollection('articles')` を再度呼んでいる。Astro は build 時に `getStaticPaths` の戻り値の `props` を各ページに渡せる仕組みを持っているため、`props: { entry }` を渡せば frontmatter での再 fetch を省ける。`works/[...slug]` は既に `find()` で正しく処理しているが、それも `getCollection` を二重に呼んでいる。両ファイルを Astro 推奨パターンに統一する。

## Current state

**関連ファイル:**
- `src/pages/blog/[...slug]/index.astro` — ブログ記事詳細ページ

**`src/pages/blog/[...slug]/index.astro` の現状（冒頭部分）:**
```astro
export async function getStaticPaths() {
    const articles = await getCollection("articles");
    return articles.map((entry) => ({
        params: { slug: entry.id },
        // props が渡されていない
    }));
}

const { slug } = Astro.params;
const allPosts = await getCollection("articles");  // ← 二重呼び出し

const sortedPosts = sortByDateDescending(allPosts)
const currentIndex = sortedPosts.findIndex((post) => post.id === slug);

if (currentIndex === -1) {
    throw new Error("Not Found");  // ← 本来到達しないが、エラーの投げ方も不適切
}
const entry = sortedPosts[currentIndex];
```

**`src/pages/works/[...slug]/index.astro` の現状（冒頭部分）:**
```astro
export const prerender = true;
export async function getStaticPaths() {
    const works = await getCollection("works");
    return works.map((entry) => ({
        params: { slug: entry.id },
        // props が渡されていない
    }));
}

const { slug } = Astro.params;
const allWorks = await getCollection("works");  // ← 二重呼び出し
const entry = allWorks.find((entry) => entry.id === slug);
if (!entry) {
    return Astro.redirect("/404");
}
```

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。Biome でフォーマット。

**参照パターン:** `src/pages/works/[...slug]/index.astro` の `prerender = true` 宣言は blog 側にもあった方が明示的だが、static output では不要。変更しない。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/pages/blog/[...slug]/index.astro`
- `src/pages/works/[...slug]/index.astro`

**Out of scope:**
- `src/pages/blog/index.astro` — 一覧ページ（別の課題）
- その他すべてのファイル

## Git workflow

- Branch: `refactor/slug-pages-getcollection`
- Commit message 例: `slug ページの getCollection 二重呼び出しを解消`

## Steps

### Step 1: blog/[...slug]/index.astro を修正する

`getStaticPaths` で `entry` と `sortedPosts`（前後記事ナビゲーション用）を props として渡す。

**修正後の `getStaticPaths`:**
```astro
export async function getStaticPaths() {
    const articles = await getCollection('articles')
    const sortedPosts = sortByDateDescending(articles)
    return sortedPosts.map((entry, index) => ({
        params: { slug: entry.id },
        props: {
            entry,
            prevPost: sortedPosts[index - 1] ?? null,
            nextPost: sortedPosts[index + 1] ?? null,
        },
    }))
}
```

**修正後の frontmatter（getStaticPaths 以降）:**

`getCollection` の再呼び出しをすべて削除し、props から受け取る:

```astro
import type { CollectionEntry } from 'astro:content'

type Props = {
    entry: CollectionEntry<'articles'>
    prevPost: CollectionEntry<'articles'> | null
    nextPost: CollectionEntry<'articles'> | null
}

const { entry, prevPost, nextPost } = Astro.props
const { Content, headings } = await render(entry)
const formattedDate = formatShortDateJP(entry.data.date)
```

削除するもの:
- `const { slug } = Astro.params;`
- `const allPosts = await getCollection("articles");`
- `const sortedPosts = sortByDateDescending(allPosts)`
- `const currentIndex = sortedPosts.findIndex((post) => post.id === slug);`
- `if (currentIndex === -1) { throw new Error("Not Found"); }`
- `const entry = sortedPosts[currentIndex];`
- `const nextPost = sortedPosts[currentIndex + 1];`
- `const prevPost = sortedPosts[currentIndex - 1];`
- import から `getCollection` の使用を確認し、不要なら import も削除する

**Verify**: `bun run astro check` → exit 0

### Step 2: works/[...slug]/index.astro を修正する

同様に `getStaticPaths` で props を渡す。

**修正後の `getStaticPaths`:**
```astro
export const prerender = true
export async function getStaticPaths() {
    const works = await getCollection('works')
    const sortedWorks = sortByDateDescending(works)
    return sortedWorks.map((entry, index) => ({
        params: { slug: entry.id },
        props: {
            entry,
            prevWork: sortedWorks[index - 1] ?? null,
            nextWork: sortedWorks[index + 1] ?? null,
        },
    }))
}
```

**修正後の frontmatter（getStaticPaths 以降）:**
```astro
import type { CollectionEntry } from 'astro:content'

type Props = {
    entry: CollectionEntry<'works'>
    prevWork: CollectionEntry<'works'> | null
    nextWork: CollectionEntry<'works'> | null
}

const { entry, prevWork, nextWork } = Astro.props
const { Content } = await render(entry)
const formattedDate = formatMonthYear(entry.data.date)
```

削除するもの:
- `const { slug } = Astro.params;`
- `const allWorks = await getCollection("works");`
- `const entry = allWorks.find(...);`
- `if (!entry) { return Astro.redirect("/404"); }`
- `const sortedWorks = sortByDateDescending(allWorks)`
- `const currentIndex = ...`
- `const nextWork = ...`
- `const prevWork = ...`

テンプレート部分では `nextWork` / `prevWork` を使う変数名に合わせて修正する（既存のテンプレートが `nextWork` / `prevWork` という名前を使っていれば変更不要。名前が違う場合は統一する）。

**Verify**: `bun run astro check` → exit 0

### Step 3: ビルド確認

**Verify**: `bun run build` → exit 0

## Test plan

テストスイートなし。手動確認:
1. `bun run build` が成功すること
2. `dist/blog/` と `dist/works/` 以下に各記事・作品の HTML が生成されていること

## Done criteria

- [ ] `grep -n "getCollection" src/pages/blog/\[...slug\]/index.astro` → `getStaticPaths` 内の1件のみ
- [ ] `grep -n "getCollection" src/pages/works/\[...slug\]/index.astro` → `getStaticPaths` 内の1件のみ
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- 修正後に `Astro.props` の型推論でエラーが出て解決策が不明な場合
- テンプレート側で `prevPost` / `nextPost` の参照が想定と異なる構造になっている場合

## Maintenance notes

- 将来記事を追加しても `getStaticPaths` が props を渡す設計になっているため追加作業は不要。
- `sortByDateDescending` は `src/lib/collectionUtils.ts` に定義されており、import は変更不要。
