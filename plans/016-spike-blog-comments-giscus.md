# Plan 016 (SPIKE): ブログコメント（giscus）の導入を検証する

> **Executor instructions**: これは**スパイク**プラン。Step に沿って最小検証し、最後に採用判断と本実装見積もりを報告する。コード変更は最小 POC に留める。「STOP conditions」該当時は報告。完了後 `plans/README.md` の行を更新。
>
> **Drift check (run first)**: `git diff --stat 890ef77..HEAD -- "src/pages/blog/[...slug]/index.astro"`

## Status

- **Priority**: P3
- **Effort**: S〜M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction（spike）
- **Planned at**: commit `890ef77`, 2026-06-25

## Why this matters

現状ブログにエンゲージメント手段がゼロ（コメント・リアクション無し）。giscus は GitHub Discussions をバックエンドにするコメントウィジェットで、サーバ不要・`output: 'static'` と相性が良く、スパム/モデレーションを Discussions 側に委譲できる。読者に GitHub アカウントを要求する点が唯一のトレードオフ。技術者向けポートフォリオなら許容範囲だが、本当に欲しいか（運用する気があるか）を含めて判断するためのスパイク。

## Current state

- `src/pages/blog/[...slug]/index.astro` — 記事詳細。末尾に「Navigation（Newer/Older/Back）」セクションがある。コメント領域はそこと Content の間/後に置くのが自然。
- リポジトリは `mikan-919` の GitHub。giscus は対象リポジトリで Discussions を有効化し、giscus アプリをインストールする必要がある（リポジトリ設定側の作業）。
- View Transitions（`ClientRouter`）を使っているため、giscus の script はページ遷移時の再初期化に注意が必要（`astro:page-load` で再マウント）。

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `bun install`         | exit 0              |
| Build     | `bun run build`       | exit 0              |
| Dev       | `bun run dev`         | ローカルで記事ページ表示 |

## Suggested executor toolkit

- giscus 公式の設定ジェネレータ（https://giscus.app）で `repo` / `repo-id` / `category-id` を取得する手順を確認。これらはリポジトリ所有者（ユーザー）側の操作が必要 → 値が無ければ STOP。
- View Transitions 環境での再初期化は Astro の `astro:page-load` イベント、または `astro-giscus` 系コンポーネントの利用を Context7 / 公式で確認。

## Scope

**In scope（POC）**:
- `src/pages/blog/[...slug]/index.astro` の Navigation 付近に giscus ウィジェットを置く POC。
- 必要なら `src/components/blog/Comments.astro`（新規）。

**Out of scope**:
- works ページへのコメント（不要）。
- リポジトリの Discussions 有効化・giscus アプリ導入（ユーザー側作業。executor は手順を案内するに留める）。

## Steps

### Step 1: 前提値の確認

giscus に必要な `repo` / `repo-id` / `category` / `category-id` が用意できるか確認。リポジトリで Discussions が有効か。未準備なら、必要な手順（Discussions 有効化＋ giscus アプリインストール＋ giscus.app で値取得）を案内して STOP。

**Verify**: 4 値が揃っている、または不足を報告。

### Step 2: 記事ページに giscus を組み込む POC

`src/pages/blog/[...slug]/index.astro` の Navigation セクション前後に giscus の script タグ（または `Comments.astro`）を追加。テーマはサイト調（`light`/`preferred_color_scheme`）。`data-lang="ja"`。

**Verify**: `bun run dev` で記事ページを開き、giscus iframe が表示されコメント欄が出る（GitHub ログイン後にコメント投稿可能）。

### Step 3: View Transitions との整合確認

ブログ記事間をリンク遷移（`ClientRouter` 経由）したとき、giscus が二重生成されず正しく再描画されるか確認。問題があれば `astro:page-load` での再初期化を入れる。

**Verify**: 記事 A→B→A と遷移しても iframe が1つだけ・正しく表示される。

### Step 4: 判断と見積もり報告

採用是非・本実装に必要な作業（テーマ追従、CLS 対策、遅延ロード）と工数を報告。POC を本マージしない場合は変更を revert。

**Verify**: 報告が存在。

## Done criteria

- [ ] giscus に必要な前提値の有無を確認/報告した
- [ ] ローカルでコメント欄が表示されることを確認した（前提値が揃う場合）
- [ ] View Transitions 下での二重生成が無いことを確認した
- [ ] 採用判断と本実装見積もりを報告した
- [ ] 本採用しない場合 POC 変更を revert した
- [ ] `plans/README.md` 更新

## STOP conditions

- Discussions 未有効 / giscus 値が取得できない → ユーザー側作業が必要、手順を案内して報告。
- View Transitions で iframe の二重生成や状態破損が解決できない → 報告。

## Maintenance notes

- giscus は外部 iframe を読み込むため、CSP やプライバシー表記が必要になりうる。
- 本実装に進む場合は別プランとして切る。テーマをサイトのカラートークンに合わせるなら giscus のカスタムテーマ CSS をホストする必要がある。
