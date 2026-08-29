---
title: "MAZE MAZE"
category: "game"
role: "Design / Development"
description: "同じ迷路を同時に解き、先に正しい線を描いた方が勝つ、ブラウザで遊べるリアルタイム1v1迷路レース。"
techStack:
    - "typescript"
    - "react"
    - "bun"
tags:
    - "Game"
    - "WebSocket"
    - "Durable Objects"
link: "https://mazemaze.mikan-919.workers.dev/"
github: "https://github.com/mikan-919/mazemaze"
date: 2026-08-29
isComingSoon: false
---

2人へ同じランダム迷路を同時に表示し、スタートからゴールまで先に正しい線を描いた方が勝つブラウザゲーム。
対戦URLの共有に加え、待機中のプレイヤー同士を組み合わせるランダムマッチにも対応している。

操作にはCanvas 2DとPointer Eventsを使用。
描画中は通過したセルだけをWebSocketで共有し、完成時にはCloudflare Durable Objectsが同じseedから迷路を再生成して経路を検証する。
迷路のseedは2人が揃うまでクライアントへ送らず、先に正しい経路を提出したプレイヤーをサーバー側で判定する設計にしている。

フロントエンドとWorkerをViteでまとめ、WebSocket Hibernation APIによる接続維持、VitestとPlaywrightによるテスト、GitHub ActionsからCloudflareへの継続的デプロイまで構成している。
