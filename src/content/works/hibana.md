---
title: "hibana"
category: "other"
role: "Language Design / Development"
description: "依存型・細分化型・代数的効果を持つ、Rust製の静的型付け言語。"
techStack:
    - "rust"
tags:
    - "Programming Language"
    - "Compiler"
    - "Type System"
github: "https://github.com/mikan-919/hibana"
githubVisibility: "public"
date: 2026-10-15
isComingSoon: false
---

依存型、Z3で証明する細分化型、代数的効果、トレイト、マクロを持つ静的型付け言語。
型検査では依存型の評価に加えて、停止性と正値性も検査する。

実行系としてインタプリタ、JavaScriptバックエンド、Cバックエンドを持つ。
フォーマッタ、テストランナー、LSPサーバーをCLIに含み、TypeScriptの宣言の読み込みやセルフホストにも取り組んでいる。
