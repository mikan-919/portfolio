---
title: "arbit"
category: "other"
role: "Design / Development"
description: "Discordの口論を要約し、合意点と対立点を並べて投稿するスラッシュコマンド。"
techStack:
    - "typescript"
    - "bun"
tags:
    - "Discord Bot"
    - "LLM"
    - "Cloudflare Workers"
github: "https://github.com/mikan-919/arbit"
githubVisibility: "public"
date: 2026-11-04
isComingSoon: false
---

`/arbit`で直近のメッセージを読み、双方の主張の要約と合意点・対立点を投稿する。
件数、開始メッセージ、時間で範囲を指定できる。

メッセージのコンテキストメニューから、説明文の補完、問題点の補完、意味の説明も使える。
`/arbit-mode on`にしたチャンネルでは、会話が1分途切れたときにBotが必要に応じて補完や仲裁を投稿する。
Cloudflare WorkersとQueuesで動く。
