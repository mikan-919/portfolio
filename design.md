# Design — mikan-919 Portfolio

ロックされたデザインシステム。ページ単位の再生成時は必ずこのファイルを先に読み、
逸脱する場合はこのファイルを更新してから実装する。

## Genre
editorial(Swiss International Typographic Style を基調に、
Emil Kowalski・catnose 的な抑制の効いたミニマルさへ寄せたクラスタ)

## Macrostructure family

- **ホーム(marketing)**: Bento Grid — Hero・Skills・Works・Blog・Timeline を
  不揃いブロックの単一グリッドに統合。ナンバリング見出し(01/02/03...)は使わない。
  セル間はケイ線(border)ではなく `gap` で区切る。画像を持つプレビュー
  (Featured Work/Article)のみ `rounded-lg` + 白い面のカードにし、罫線は置かない。
  それ以外のテキストのみのセル(Skills・リスト項目・ナビリンク等)は
  背景もボーダーも無いフラット表示にする(Emil Kowalski 的な余白駆動)
- **一覧ページ(Works一覧・Blog一覧・タグ別一覧)**: Portfolio Grid — フィルタ可能な
  カードグリッド。Works と Blog は type prop で出し分ける共通コンポーネント。
  ここは画像プレビューを伴うため catnose 的なソフトカード(rounded + 面の明度差
  + pill タグ)を維持する。カードとタグに罫線は置かない
- **詳細ページ(Works詳細・Blog記事詳細)**: Long Document — 本文中心の連続した
  読み物。ToC は Blog 記事のみ。
- **About**: Bento Grid 系(bio・GitHub活動・values・learning/interests)。
  画像を持たないため全セルフラット(背景・ボーダー無し)、gap と見出しの
  太字だけで区切る

## Theme — Monochrome Swiss Minimal

- `--color-lp-bg`             oklch(97% 0 0)   淡いグレーの紙
- `--color-lp-surface`        oklch(100% 0 0)  白い面
- `--color-lp-surface-sunken` oklch(93% 0 0)   沈んだ面
- `--color-lp-border`         oklch(74% 0 0)   意味のある線専用
- `--color-lp-border-subtle`  oklch(88% 0 0)
- `--color-lp-text`           oklch(14% 0 0)   インク
- `--color-lp-muted`          oklch(42% 0 0)
- `--color-lp-subtle`         oklch(52% 0 0)   小さい補助テキストでも WCAG AA を満たすグレー
- `--color-lp-accent`         oklch(18% 0 0)   強調用の黒
- `--color-lp-accent-on`      oklch(98% 0 0)
- `--color-lp-accent-subtle`  oklch(91% 0 0)
- `--color-lp-accent-strong`  oklch(8% 0 0)
- `--color-lp-dark`           oklch(11% 0 0)
- `--color-lp-dark-text`      oklch(97% 0 0)
- `--color-lp-dark-muted`     oklch(65% 0 0)

軸: paper-band = cool light / display-style = grotesque-medium(太すぎない sans) /
accent-hue = none。階層は黒・白・グレーの明度差と余白で表現する

## Typography

- Display: Inter(Bold 700)+ 日本語は Zen Kaku Gothic New。ポスター的な極太
  ディスプレイ書体(Archivo Black)は廃止 — 見出しはサイズと余白で階層化する
- Body: Inter(既存)、日本語は Zen Kaku Gothic New
- Mono: UDEV Gothic。日付・ハンドル・タグチップ・コード等の「データ」表示のみに限定する
- ラベル(Profile / Activity / Tags 等の小見出し)は mono ではなく通常の sans
  (`text-xs text-lp-subtle`)、大文字強制(uppercase)・強いトラッキングは使わない
- Figtree・Rampart One は使用箇所なしのため廃止
- 見出しは常に roman(イタリック禁止)。強調は太さ・アクセント色・下線で表現

## Spacing / Radius

- 既存 Tailwind 4pt spacing を継続使用
- 角丸は小さめ(`rounded-md`〜`rounded-lg`、ピル状要素は `rounded-full`)を
  ボタン・タグ・カード・バッジに適用する。スラブ的な直角一辺倒(角丸0)は廃止
- 罫線は原則使わない。カード・タグ・画像・Headerの輪郭は背景の明度差と余白で表現する
- Timeline/ToCのスパインやフィルターの選択下線など、構造や状態を伝える線だけを
  ヘアラインで許可する。`border-2` 以上の太い罫線や装飾目的の区切り線は使わない
- 同一背景色で隣接するセクション同士を区切る罫線
  (`border-b`/`divide-x`/`divide-y`)は置かない。区切りは `gap` と余白のみで表現する

## Motion

- View Transitions(ClientRouter)は既存のまま継続
- ホバーは色・背景・枠線の微細なトランジションのみ。scale等の演出も
  控えめ(1.02〜1.03 程度)に留める
- transform / opacity のみアニメーション対象。`prefers-reduced-motion` 対応は既存のまま

## Microinteractions

- ホバーは色・下線・淡い背景変化・枠線変化のみ。反転(black↔white)や
  トースト等の強い演出は使わない

## CTA voice

- 1画面につき主要アクションは1つまで: 塗り(accent)・`rounded-full`・
  控えめなサイズ(`px-5 min-h-11`)・通常大文字小文字(uppercase禁止)
- それ以外のアクション(secondary/GitHubリンク等)はボタン化しない — 下線なし
  プレーンテキストリンク+矢印(`→`)、ホバーは文字色の変化のみ
- フィルター/タブは背景・枠線を持たず、下線(border-b)で選択状態を示す
  テキストタブにする(`.filter-btn`)。カード上のオーバーレイCTA(画像に重ねる
  ボタン)のみ、視認性のため軽い塗り+shadowのピルを許容する(`.btn-brutal`)

## Nav / Footer

- Nav: 罫線なしの半透明フローティング面、控えめなワードマーク、通常表記の
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

- ワードマーク、モノクロームの配色、Inter + Zen Kaku Gothic New
  のペアリング、CTA ボイス、小さめ角丸、罫線に頼らない余白設計

## What pages MAY differ on

- ページ種別ファミリー内でのアーキタイプ(例: ホームの bento タイル配分)
