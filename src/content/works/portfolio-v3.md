---
title: "ポートフォリオサイト v3"
category: "web site"
role: "Design / Development"
description: "このサイトです。モノクロームに柿色を差したtactical UIで、全ページを1画面とページ送りで構成しました。"
techStack:
    - "astro"
    - "solidjs"
    - "tailwind-css"
    - "typescript"
image: "../../assets/images/works/portfolio-v3.webp"
tags:
    - "UI"
    - "Design"
    - "View Transitions"
github: "https://github.com/mikan-919/portfolio"
githubVisibility: "public"
link: "https://portfolio.mikan-919.workers.dev"
date: 2026-11-12
isComingSoon: false
---

v2のSwiss Styleのグリッドと余白を土台に残し、面取り、ヘアライン、英日併記のラベル、シェーダーの演出を重ねた。
色はモノクロームの明度差で階層を作り、柿色を唯一の信号色としてリンク、選択中、フォーカスリング、ハザードストライプに使う。

文書としての縦スクロールをなくし、全ページをビューポートの高さに収めた。
収まらない中身は横方向のページに分け、ホイール、キー、スワイプ、ボタンで送る。
一覧は縦長のカードを横に並べ、記事と作品の詳細は本文の段を1ページずつ送る。

ページ遷移はView Transitionsで、クリックした要素が次の画面へ流れ込むようにした。
ホームはプロフィール票とメニュータイルを1つの場面としてポインターの位置で傾け、HTML-in-Canvasのシェーダーで演出を加えている。
画像のない記事と作品には、方眼、等高線、計器、網点を組み合わせたカバーを生成する。
