# Design — mikan-919 Portfolio

ロックされたデザインシステム。ページ単位の再生成時は必ずこのファイルを先に読み、
逸脱する場合はこのファイルを更新してから実装する。

## Genre
tactical UI(Arknights の公式サイト・ゲーム内UIを参照した、工業的で情報密度のある
モノクローム画面)。Swiss 的なグリッドと余白は土台として残し、その上に
面取り・ヘアライン・英日併記ラベル・シェーダー演出を重ねる

## Macrostructure family

- **ホーム**: Hero(プロフィール票)+ 英日併記の見出しで区切った
  Skills / Works / Blog / Timeline の縦積み。Works と Blog は
  「Featured カード + 行リスト」の2カラムで、左右を交互に入れ替える。
  Featured Work/Article は `image` を持つエントリを優先し、同じプロジェクトが
  両方のカードに並ばないようにする
- **一覧ページ(Works一覧・Blog一覧・タグ別一覧)**: Portfolio Grid — フィルタ可能な
  カードグリッド。Works と Blog は type prop で出し分ける共通コンポーネント。
  先頭の Featured も `image` を持つエントリを優先する
- **詳細ページ(Works詳細・Blog記事詳細)**: Long Document — 本文中心の連続した
  読み物。ToC は Blog 記事のみ。演出は載せない
- **About**: ページ見出し + フラットなセルのグリッド + dark 面の Timeline

## Theme — Monochrome + Persimmon Accent

- `--color-lp-bg`             oklch(97% 0 0)   淡いグレーの紙
- `--color-lp-surface`        oklch(100% 0 0)  白い面
- `--color-lp-surface-sunken` oklch(93% 0 0)   沈んだ面
- `--color-lp-border`         oklch(74% 0 0)   ヘアライン
- `--color-lp-border-subtle`  oklch(88% 0 0)
- `--color-lp-text`           oklch(14% 0 0)   インク
- `--color-lp-muted`          oklch(42% 0 0)
- `--color-lp-subtle`         oklch(52% 0 0)   小さい補助テキストでも WCAG AA を満たすグレー
- `--color-lp-accent`         oklch(18% 0 0)   強調用の黒
- `--color-lp-accent-on`      oklch(98% 0 0)
- `--color-lp-accent-subtle`  oklch(91% 0 0)
- `--color-lp-accent-strong`  oklch(8% 0 0)
- `--color-lp-highlight`      oklch(52% 0.17 40)  柿色
- `--color-lp-dark`           oklch(11% 0 0)
- `--color-lp-dark-text`      oklch(97% 0 0)
- `--color-lp-dark-muted`     oklch(65% 0 0)

階層は黒・白・グレーの明度差で表現する。柿色は Arknights の黄・シアンに相当する
唯一の信号色で、リンク・選択中・フォーカスリング・ワードマーク・見出しマーカー・
ハザードストライプ・ホバー時のバー・シェーダーの粒子に使う。本文の面や大きな塗りには使わない

### Dark mode

- `prefers-color-scheme: dark` で反転する。テーマ切替UIは持たない
- Footer と About の Timeline が使う `dark` 面は、ダークモードでも bg より暗い帯として維持する
- 画像・OG画像は反転しない

### Generated covers

- `image` を持たない Works/Article には、ID のハッシュから決定的に生成するカバーを当てる
- 紙・インク・グレーで構成し、柿色は1点だけ差す
- 1280x720 の PNG をビルド時に生成し、外部ネットワークに依存しない

## Typography

- Display / ラベルの欧文: Oxanium(500 / 700)。角を落とした字形で Bender 系の代替。
  日本語は Zen Kaku Gothic New
- Body: Inter、日本語は Zen Kaku Gothic New
- Mono: UDEV Gothic。日付・ハンドル・コード等の「データ」表示のみ
- 欧文のページ見出し・セクション見出しは大文字、日本語の副題を併記する
  (`WORKS 制作実績`)。併記は `SectionTitle.astro` に集約する
- 小ラベルは `.label-tech`(Oxanium 500・11px・大文字・tracking 0.14em)
- 見出しは常に roman(イタリック禁止)

## Shape / Line

- 角丸は使わない。面は直角、または右下を 45° で落とす(`.chamfer` / `.card-cut`)
- 主要ボタンは左上と右下を落とす(`.btn-cut`)
- ヘアライン(1px)は構造を示す場所に使う: Header 下端、見出しの延長線、
  行リストの区切り、スペック欄の左罫。`border-2` 以上は使わない
- 面取りした要素に border は付けない(clip-path で欠けるため)。面の明度差で輪郭を出す
- 装飾は次の4種に限る: ハザードストライプ(`.hazard`)、ドットグリッド(`.grid-dots`)、
  アウトラインの巨大数字、見出し先頭の柿色スクエア

## Motion

動きは大きく、立体的に付ける。対象は transform / opacity / シェーダーに限る。

- **HTML-in-Canvas**(`FxCanvas.astro` + `src/lib/fx.ts`): Hero と一覧/About の
  ページ見出しは、実DOMを WebGL のテクスチャにして3D空間の板として描く。
  `data-fx-layer="<z>"` を付けた要素は奥行きの違う別レイヤーになる
  (Hero は 背景の 919 / 本文 / 名前 の3枚)。DOM はそのまま操作・選択・読み上げできる
  - 起動: 各レイヤーが奥から回転しながら跳ね起き、横スライスと走査線が揃う
  - ポインター: 板がばねで傾き、動かしている間は周辺が粒子に分解されて弾かれる。
    止めると元に戻る(指している文字を読めるようにするため)
  - クリック: 波紋が広がり、板が奥へ押されて戻る
  - スクロール: 板が奥へ倒れながら消える
  - 静止中は数秒おきに短いグリッチ
- **スクロール連動**(CSS scroll-driven animations): `.reveal`(下から起き上がる)/
  `.reveal-l` / `.reveal-r`(左右から回り込む)。画面に入るときと上へ抜けるときに動く。
  隣り合う要素は逆方向から入れる
- **View Transitions**(ClientRouter): 旧ページが暗くなりながら奥へ回り、
  新ページが回り込みつつ斜めのワイプで現れる
- ホバーは色・背景の変化と柿色バーの伸長
- 非対応ブラウザと `prefers-reduced-motion` では、いずれも静止した通常の HTML になる
- rAF は何かが動いている間だけ回す

## CTA voice

- 1画面につき主要アクションは1つまで: `.btn-cut`(塗り accent、ホバーで柿色)
- それ以外のアクションはボタン化しない — プレーンテキストリンク+矢印(`→`)
- フィルター/タブは下線(border-b)で選択状態を示すテキストタブ(`.filter-btn`)。
  カード上のオーバーレイCTAのみ軽い塗りを許容する(`.btn-brutal`)

## Nav / Footer

- Nav: 半透明の面 + 下端ヘアライン。リンクは英(Oxanium 大文字)と日(小)の2段併記。
  現在地は `highlight` 色のバーで示す
- Footer: dark 面、上端にハザードストライプ。コピーライト行のみ UDEV Gothic Mono

## 共通コンポーネント方針

- Works/Blog のカード・ヘッダー・フィルター・リスト・アーカイブ・フィーチャー系は
  それぞれ1系統に統合し、`type: 'work' | 'article'` で出し分ける
- ホーム/About の Timeline は1コンポーネントに統合(向きを prop 化)
- `Section.astro`(`isGrow?, class?, id?`)を全ページで一貫使用し、
  ページ側で罫線・コンテナ幅を再実装しない

## What pages MUST share

- ワードマーク、モノクロームの配色と柿色の信号色、Oxanium + Zen Kaku Gothic New の
  英日併記、面取り、ヘアライン

## What pages MAY differ on

- ページ種別ファミリー内でのアーキタイプ(例: ホームの Featured の左右)
