# Plan 011: About ページのハードコードされたコンテンツを JSON に移行する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/pages/about/index.astro src/content/data/my-info.json`
> If any in-scope file changed, compare before proceeding.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt / direction
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`src/pages/about/index.astro` に自己紹介文・ハンドル名・"LAST UPDATED" 日付がハードコードされており、更新するにはコードを直接編集する必要がある。`src/content/data/my-info.json` はすでに存在し `InfoGrid.astro` で使われているため、この JSON に bio などを追加してページから読み込む形に統一する。

## Current state

**関連ファイル:**
- `src/pages/about/index.astro` — bio・ハンドル名・"LAST UPDATED" がハードコード
- `src/content/data/my-info.json` — 現在 `learning` と `interests` のみ収録
- `src/components/sections/about/InfoGrid.astro` — `my-info.json` を読み込む既存パターン

**`src/pages/about/index.astro` のハードコード部分（Bio + Info Grid セクション）:**
```astro
<div class="flex flex-col gap-6">
    <div>
        <h2 class="font-display text-4xl leading-tight tracking-tight text-lp-text">摘果みかん</h2>
        <p class="font-mono text-xs text-lp-muted mt-1">@mikan-919</p>
    </div>
    <p class="text-sm text-lp-muted leading-relaxed">
        学校の勉強の傍ら、趣味でプログラミングを学習している学生。<br />
        まだ始めたばかりですが、コードを書いて動くものを作るプロセスが好き。<br />
        最近は、モダンなフロントエンド技術（Astro, SolidJSなど）に関心があり、このポートフォリオもその実験の場として作成している。<br />
        趣味でプログラミングとは言っているが、正直他に得意分野がないので将来はエンジニアになることを目指している。
    </p>
    <p class="font-mono text-[11px] text-lp-subtle">LAST UPDATED: 2024.11.28</p>
</div>
```

**`src/content/data/my-info.json` の現状:**
```json
{
    "learning": { "title": "LEARNING", "subtitle": "...", "items": [...] },
    "interests": { "title": "INTERESTS", "subtitle": "...", "items": [...] }
}
```

**`InfoGrid.astro` でのデータ読み込みパターン（参照用）:**
```astro
import myInfo from '@/content/data/my-info.json'
const { learning, interests } = myInfo
```

**コードスタイル規約:** TypeScript strict mode、シングルクォート、セミコロンなし。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/content/data/my-info.json`
- `src/pages/about/index.astro`

**Out of scope:**
- `src/components/sections/about/InfoGrid.astro` — 既存フィールドの読み込みのみ、変更不要
- `src/content/config.ts` — `my-info.json` はコレクション定義を使わず直接 import しているため変更不要

## Git workflow

- Branch: `refactor/about-content-to-json`
- Commit message 例: `About ページの自己紹介をデータファイルに移動`

## Steps

### Step 1: my-info.json に bio フィールドを追加する

`src/content/data/my-info.json` に `profile` セクションを追加する:

```json
{
    "profile": {
        "name": "摘果みかん",
        "handle": "@mikan-919",
        "bio": "学校の勉強の傍ら、趣味でプログラミングを学習している学生。\nまだ始めたばかりですが、コードを書いて動くものを作るプロセスが好き。\n最近は、モダンなフロントエンド技術（Astro, SolidJSなど）に関心があり、このポートフォリオもその実験の場として作成している。\n趣味でプログラミングとは言っているが、正直他に得意分野がないので将来はエンジニアになることを目指している。",
        "lastUpdated": "2024.11.28"
    },
    "learning": { ... },
    "interests": { ... }
}
```

`bio` 内の改行は `\n` で表現する。

**Verify**: `node -e "const d=require('./src/content/data/my-info.json'); console.log(d.profile.name)"` → `摘果みかん`

### Step 2: about/index.astro で my-info.json を読み込みテンプレートを置き換える

`src/pages/about/index.astro` の frontmatter に import を追加:

```astro
import myInfo from '@/content/data/my-info.json'
const { profile } = myInfo
```

テンプレートのハードコード部分を以下に置き換える:

```astro
<div class="flex flex-col gap-6">
    <div>
        <h2 class="font-display text-4xl leading-tight tracking-tight text-lp-text">{profile.name}</h2>
        <p class="font-mono text-xs text-lp-muted mt-1">{profile.handle}</p>
    </div>
    <p class="text-sm text-lp-muted leading-relaxed" set:html={profile.bio.replace(/\n/g, '<br />')} />
    <p class="font-mono text-[11px] text-lp-subtle">LAST UPDATED: {profile.lastUpdated}</p>
</div>
```

**Verify**: `bun run astro check` → exit 0

### Step 3: ビルド確認

**Verify**: `bun run build` → exit 0

ビルド後:
```sh
grep '摘果みかん' dist/about/index.html
```
→ 1件以上表示される

## Done criteria

- [ ] `grep -n '"摘果みかん"' src/pages/about/index.astro` → 0件（JSON から読み込まれているため）
- [ ] `grep 'profile' src/content/data/my-info.json` → 1件以上
- [ ] `bun run astro check` が exit 0
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- `set:html` の使用が Astro の CSP 設定と競合する場合 → `bio` を配列（段落ごと）にして `{bio.map(p => <p>{p}</p>)}` で代替すること

## Maintenance notes

- 自己紹介を更新するときは `src/content/data/my-info.json` の `profile` フィールドだけ編集すればよい。コードに触れる必要はない。
- `lastUpdated` は手動更新が必要。更新時に忘れずに変更すること。
- `bio` の改行を `\n` で管理しているが、将来的に Markdown にしたい場合は `summary` フィールドと同様に `.md` ファイルにするか、content collection を使う。
