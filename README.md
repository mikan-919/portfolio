# Portfolio

モダンな(当社比)Web技術を使用して構築された、パフォーマンスとデザインに焦点を当てた私のポートフォリオサイトです。

## 技術スタック

- **フレームワーク:** [Astro](https://astro.build/)
- **UIライブラリ:** [SolidJS](https://www.solidjs.com/)
- **スタイリング:** [Tailwind CSS v4](https://tailwindcss.com/)
- **公開:** [Cloudflare Workers](https://workers.cloudflare.com/)（[Cloudflare CLI](https://developers.cloudflare.com/cf/) を使用）
- **ツール:**
  - [Biome](https://biomejs.dev/) (フォーマッター & リンター)
  - [Husky](https://typicode.github.io/husky/) (Git hooks)
  - [Commitlint](https://commitlint.js.org/) (コミットメッセージのリンター)



## 開発
(以下は私が忘れた時用)

Node.js 22.18 以降と Bun が必要です。依存関係は `bun install --frozen-lockfile` で導入します。Cloudflare CLI は Node.js で動くため、`bun --bun` で実行しないでください。

開発サーバーを起動します:

```bash
bun run dev
```

### チェックとビルド

Astroの型・コンテンツチェックを実行します:

```bash
bun run check
```

本番用にプロジェクトをビルドします:

```bash
bun run build
```

### プレビュー

ビルドされたサイトをローカルでプレビューします:

```bash
bun run preview
```

### 公開

Cloudflare CLI にログインします:

```bash
bun run cloudflare auth login
```

Wrangler のログイン情報は引き継がれません。設定は `cloudflare.config.ts`、生成される公開用ファイルは `.cloudflare/output/v0/` にあります。

ビルド後、アップロードせずに公開用ファイルを検証します:

```bash
bun run build
bun run cloudflare deploy --prebuilt --mode production --dry-run
```

公開します。このコマンドはビルドも実行します:

```bash
bun run deploy
```

注: `--prebuilt` は生成済みのファイルを使い、`--dry-run` はアップロードを省きます。`--mode production` は生成時の設定に合わせる指定です。Cloudflare CLI と対応する Astro・Cloudflare アダプターはベータ版を固定しています。

互換日付は、アダプターに含まれるローカル実行環境が対応する `2026-10-07` にしています。OG 画像の生成で Node.js 用のネイティブライブラリ（`@resvg/resvg-js`）を使うため、ページの事前生成は `prerenderEnvironment: 'node'` に設定しています。

`cf deploy` は Workers に公開します。既存の Pages サイトは更新されません。公開先を切り替えるときは、ドメインの設定と `astro.config.mts` の `site`（正規 URL とサイトマップに使う公開 URL）を合わせて更新してください。

## スクリプト

| スクリプト | 説明 |
| :--- | :--- |
| `dev` | Cloudflare CLI 経由で Astro 開発サーバーを起動します。 |
| `check` | Astroの型・コンテンツチェックを実行します。 |
| `build` | Cloudflare CLI 経由で本番用にサイトをビルドします。 |
| `deploy` | ビルドして Cloudflare Workers に公開します。 |
| `cloudflare` | Cloudflare CLI のコマンドを実行します。 |
| `preview` | ビルドされたサイトをプレビューします。 |
| `fmt` | Biomeを使用してコードのチェックとフォーマットを行います。 |
| `prepare` | Huskyのgit hooksをセットアップします。 |

## プロジェクト構造

```text
/
├── public/       # 静的アセット
├── src/
│   ├── assets/   # アセット
│   ├── components/ # コンポーネント
│   ├── content/  # コンテンツコレクション
│   ├── layouts/  # レイアウト
│   ├── pages/    # ページ
│   └── styles/   # グローバルスタイル
├── astro.config.mts # Astro設定
├── cloudflare.config.ts # Cloudflare設定
├── package.json  # プロジェクトの依存関係とスクリプト
└── ...
```
