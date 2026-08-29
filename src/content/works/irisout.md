---
title: "irisout"
category: "other"
role: "Design / Development"
description: "JSXを書くと、仮想DOMもリアクティブランタイムも持たない手書き相当のvanilla JSにコンパイルするビルド時コンパイラ。"
techStack:
    - "typescript"
    - "bun"
tags:
    - "Compiler"
    - "JSX"
    - "Performance"
image: "../../assets/images/works/irisout.webp"
github: "https://github.com/mikan-919/irisout"
date: 2026-07-22
isComingSoon: false
---

Reactの代替ではなく、「もし人間がこのUIをvanilla JSで手書きするなら」を自動でやらせるコンパイラ。
ビルド時に一度実行してコンポーネント構造・signal・propsを確定させ、JSXの依存関係だけを静的解析するハイブリッド方式を採用している。

TodoMVC相当のベンチマークでは、素朴なReact(useStateのみ)より全シナリオで1.1〜4倍高速という結果が出ている。
まだ実験的な段階で制約もあるが、TypeScript書き直し後のM1〜M6実装が完了し「使ってもらえる閾値」に到達した。
