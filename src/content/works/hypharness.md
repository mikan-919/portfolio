---
title: "hypharness"
category: "web app"
role: "Design / Development"
description: "最終目的を課題に分解し、複数のエージェントが分担して解きながら自身を改良するハーネス。"
techStack:
    - "typescript"
    - "bun"
tags:
    - "AI Agent"
    - "Multi Agent"
    - "Self Improvement"
github: "https://github.com/mikan-919/hypharness"
githubVisibility: "public"
date: 2026-10-29
isComingSoon: false
---

利用者との対話で最終目的を詰め、分解役が課題文に分ける。
各課題は方針役が受け入れ条件と「やらないこと」を決め、検証生成役が失敗するテストを書き、回答エージェントが解く。

エージェントは中央のまとめ役を持たず、共有文脈とタスク待ち行列で作業を分担するDeLM方式で動く。
検査を通った解答は統合ブランチに課題ごとのコミットとして積まれる。

課題をまたぐ層では、弱点発見・提案・回帰テスト・採用の周を回してハーネス自身のコードとプロンプトを改良する。
ダッシュボードはirisoutで作り、改良の各周の候補と判定を後から読めるようにしている。

2026年11月に開発を止めた。理由と、次に持っていく設計判断は[hypharnessを止めた](/blog/2026-11-13-hypharness/)に書いた。
