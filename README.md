# Portfolio

モダンなWeb技術を使用して構築された、パフォーマンスとデザインに焦点を当てた私のポートフォリオサイトです。

## 技術スタック

- **フレームワーク:** [Astro](https://astro.build/)
- **UIライブラリ:** [SolidJS](https://www.solidjs.com/)
- **スタイリング:** [Tailwind CSS v4](https://tailwindcss.com/)
- **デプロイ:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **ツール:**
  - [Biome](https://biomejs.dev/) (フォーマッター & リンター)
  - [Husky](https://typicode.github.io/husky/) (Git hooks)
  - [Commitlint](https://commitlint.js.org/) (コミットメッセージのリンター)



## 開発

開発サーバーを起動します:

```bash
bun run dev
```

### ビルド

本番用にプロジェクトをビルドします:

```bash
bun run build
```

### プレビュー

ビルドされたサイトをローカルでプレビューします:

```bash
bun run preview
```

## スクリプト

| スクリプト | 説明 |
| :--- | :--- |
| `dev` | Astro開発サーバーを起動します。 |
| `build` | 本番用にサイトをビルドします。 |
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
├── astro.config.mjs # Astro設定
├── package.json  # プロジェクトの依存関係とスクリプト
└── ...
```
