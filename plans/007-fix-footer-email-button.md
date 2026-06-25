# Plan 007: Footer の「メールを送る」ボタンのリンクを修正する

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 975976a..HEAD -- src/components/Footer.astro`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `975976a`, 2026-06-25

## Why this matters

`src/components/Footer.astro` の「メールを送る」と書かれたボタンが `https://twitter.com/mikan_919_main` にリンクしている。ラベルとリンク先が一致しておらず、ユーザーが混乱する。メールアドレスを公開しない場合は、ボタンのラベルを実際のリンク先（X / Twitter）に合わせるか、別の連絡手段に変更する必要がある。

## Current state

**関連ファイル:**
- `src/components/Footer.astro` — フッターコンポーネント

**現状の問題コード（`Footer.astro` の right カラム）:**
```astro
<a
  href="https://twitter.com/mikan_919_main"
  target="_blank"
  class="w-full text-center bg-lp-accent text-lp-accent-on font-sans font-semibold text-sm py-3 px-6 rounded hover:opacity-90 transition-opacity"
>
  メールを送る
</a>
```

「メールを送る」とラベルされているが、`href` は Twitter URL。

## Commands you will need

| Purpose    | Command               | Expected on success |
|------------|-----------------------|---------------------|
| Typecheck  | `bun run astro check` | exit 0, no errors   |
| Build      | `bun run build`       | exit 0              |

## Scope

**In scope:**
- `src/components/Footer.astro`（1箇所のみ）

**Out of scope:**
- その他すべてのファイル

## Git workflow

- Branch: `fix/footer-contact-button`（または plan 004 と同じブランチにまとめてもよい）
- Commit message 例: `Footer の連絡先ボタンのラベルを修正`

## Steps

### Step 1: ボタンのラベルを Twitter に合わせて修正する

メールアドレスを公開したくない場合（デフォルト）、ラベルを「X / Twitter で連絡する」などに変更する。リンク先は変更しない。

**Before:**
```astro
  メールを送る
```

**After:**
```astro
  X / Twitter で連絡する
```

**Verify**: `grep -n 'メールを送る' src/components/Footer.astro` → 0 件

### Step 2: ビルド確認

**Verify**: `bun run build` → exit 0

## Test plan

テストスイートなし。`bun run build` 後に `dist/index.html` で「メールを送る」が消えていることを確認:
```sh
grep 'メールを送る' dist/index.html
```
→ 0 件

## Done criteria

- [ ] `grep -rn 'メールを送る' src/` が 0 件
- [ ] `bun run build` が exit 0
- [ ] `plans/README.md` のステータス行を DONE に更新

## STOP conditions

- なし（単純な文字列置換のみ）

## Maintenance notes

- 将来メールアドレスを公開する場合は `href="mailto:your@email.com"` に変更し、`target="_blank"` と `rel="noopener noreferrer"` は不要になる（`mailto:` リンクは新しいタブで開かない）。
