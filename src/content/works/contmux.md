---
title: "contmux"
category: "other"
role: "Design / Development"
description: "並列AIエージェントの作業環境をコンテナ単位で隔離し、tmuxのように操作できるRust製TUI。"
techStack:
    - "rust"
tags:
    - "TUI"
    - "Docker"
    - "AI Agent"
github: "https://github.com/mikan-919/contmux"
date: 2026-08-23
isComingSoon: false
---

Claude Codeなどのエージェントを並列実行するときに、コードだけでなくパッケージやシステム状態までコンテナ単位で隔離するターミナルマルチプレクサ。

tmuxに近いキーバインドでペイン分割、detach・reattach、スクロールバック、コンテナのAdoptなどを操作できる。
セッション維持はDockerやPodmanに任せ、自前の常駐サーバーを持たない構成にしている。

ワークツリーとテンプレートを組み合わせた作業環境の起動や、同じコンテナへのsubペイン追加にも対応している。
