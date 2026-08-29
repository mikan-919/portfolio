---
title: "Rhodolite"
category: "other"
role: "Language Design / Compiler Development"
description: "関数を跨いで要求が伝播する『切れない束縛』を言語機能として扱う、Rust製のプログラミング言語。"
techStack:
    - "rust"
tags:
    - "Programming Language"
    - "Compiler"
    - "WebAssembly"
github: "https://github.com/mikan-919/rhodolite"
date: 2026-07-27
isComingSoon: false
---

関数呼び出しを跨いで依存の要求を伝播させ、呼び出し側の中継コードを増やさずに実装を差し替えられる独自言語。
DIコンテナをライブラリとして追加するのではなく、要求の推論と提供を言語の意味論として設計している。

Rustでlexer・parser・型付きHIR・所有権検査・インタプリタ・CLIを実装。
到達した関数を実装の組み合わせごとに特殊化し、Core WebAssemblyへ直接生成するバックエンドも備えている。

設計の中心部分は自分で実装し、判断の背景をADRとして記録することで、処理系の仕組みと設計意図の両方を説明できる開発を目指している。
