# Design — mikan-919 Portfolio

ロックされたデザインシステム。ページ単位の再生成時は必ずこのファイルを先に読み、
逸脱する場合はこのファイルを更新してから実装する。

## Genre
editorial(Swiss International Typographic Style を基調に、
Emil Kowalski・catnose 的な抑制の効いたミニマルさへ寄せたクラスタ)

## Macrostructure family

- **ホーム(marketing)**: Bento Grid — Hero・Skills・Works・Blog・Timeline を
  不揃いブロックの単一グリッドに統合。ナンバリング見出し(01/02/03...)は使わない。
- **一覧ページ(Works一覧・Blog一覧・タグ別一覧)**: Portfolio Grid — フィルタ可能な
  カードグリッド。Works と Blog は type prop で出し分ける共通コンポーネント。
- **詳細ページ(Works詳細・Blog記事詳細)**: Long Document — 本文中心の連続した
  読み物。ToC は Blog 記事のみ。
- **About**: Bento Grid 系(bio・skills・GitHub活動・values・timeline を
  不揃いブロックで)。

## Theme — Swiss Minimal

- `--color-lp-bg`             oklch(98% 0.004 85)   紙
- `--color-lp-surface`        oklch(99% 0.002 85)   紙より明るい面
- `--color-lp-surface-sunken` oklch(95% 0.006 85)   沈んだ面
- `--color-lp-border`         oklch(82% 0.01 85)
- `--color-lp-border-subtle`  oklch(90% 0.006 85)
- `--color-lp-text`           oklch(16% 0.01 50)    インク
- `--color-lp-muted`          oklch(46% 0.01 50)
- `--color-lp-subtle`         oklch(62% 0.01 50)
- `--color-lp-accent`         oklch(55% 0.21 27)    赤(唯一のアクセント)
- `--color-lp-accent-on`      oklch(98% 0.005 85)
- `--color-lp-accent-subtle`  oklch(95% 0.03 27)
- `--color-lp-accent-strong`  oklch(45% 0.19 27)
- `--color-lp-dark`           oklch(14% 0.01 50)
- `--color-lp-dark-text`      oklch(97% 0.005 85)
- `--color-lp-dark-muted`     oklch(58% 0.01 50)

軸: paper-band = light / display-style = grotesque-medium(太すぎない sans) /
accent-hue = warm(red, ~27°、使用量は従来よりさらに抑える)

## Typography

- Display: Inter(Bold 700)+ 日本語は Zen Kaku Gothic New。ポスター的な極太
  ディスプレイ書体(Archivo Black)は廃止 — 見出しはサイズと余白で階層化する
- Body: Inter(既存)、日本語は Zen Kaku Gothic New
- Mono / ラベル / データ: UDEV Gothic。ラベル用途では多用しすぎない
  (ページ全体でトラッキングの強い全角大文字ラベルを乱立させない)
- Figtree・Rampart One は使用箇所なしのため廃止
- 見出しは常に roman(イタリック禁止)。強調は太さ・アクセント色・下線で表現

## Spacing / Radius

- 既存 Tailwind 4pt spacing を継続使用
- 角丸は小さめ(`rounded-md`〜`rounded-lg`、ピル状要素は `rounded-full`)を
  ボタン・タグ・カード・バッジに適用する。スラブ的な直角一辺倒(角丸0)は廃止
- 罫線はヘアライン(1px, `border`)を基本とする。`border-2` 以上の太い罫線・
  塗りつぶしのフルインバートホバーは使わない

## Motion

- View Transitions(ClientRouter)は既存のまま継続
- ホバーは色・背景・枠線の微細なトランジションのみ。scale等の演出も
  控えめ(1.02〜1.03 程度)に留める
- transform / opacity のみアニメーション対象。`prefers-reduced-motion` 対応は既存のまま

## Microinteractions

- ホバーは色・下線・淡い背景変化・枠線変化のみ。反転(black↔white)や
  トースト等の強い演出は使わない

## CTA voice

- Primary: 塗り(accent)、`rounded-full`、通常大文字小文字(uppercase禁止)
- Secondary: アウトライン(hairline border)、`rounded-full`、ホバーは
  淡い背景色または枠線色の変化のみ

## Nav / Footer

- Nav: ヘアラインの border-bottom、控えめなワードマーク、通常表記の
  ナビゲーションリンク(uppercase・強いトラッキングは使わない)
- Footer: 本文は可読性重視の sans/日本語フォントを使用し、コロフォン的な
  コピーライト行のみ UDEV Gothic Mono を残す

## 共通コンポーネント方針

- Works/Blog のカード・ヘッダー・フィルター・リスト・アーカイブ・フィーチャー系は
  それぞれ1系統に統合し、`type: 'work' | 'article'` で出し分ける
- ホーム/About の Timeline は1コンポーネントに統合(向きを prop 化)
- `Section.astro`(`isGrow?, class?, id?`)を全ページで一貫使用し、
  ページ側で罫線・コンテナ幅を再実装しない

## What pages MUST share

- ワードマーク、赤アクセントの使用箇所(≤5%/viewport)、Inter + Zen Kaku Gothic New
  のペアリング、CTA ボイス、小さめ角丸、ヘアライン罫線

## What pages MAY differ on

- ページ種別ファミリー内でのアーキタイプ(例: ホームの bento タイル配分)
