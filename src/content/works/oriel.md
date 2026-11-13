---
title: "Oriel"
category: "web app"
role: "Design / Development"
description: "ローカルのCodexをブラウザーから操作し、GitHub IssueとLinearで開発を進めるツール。"
techStack:
    - "rust"
    - "typescript"
tags:
    - "Developer Tools"
    - "AI Agent"
    - "Cloudflare Workers"
github: "https://github.com/mikan-919/oriel"
githubVisibility: "public"
date: 2026-10-05
isComingSoon: false
---

利用端末で動くデーモン`orield`、ブラウザーの操作画面、端末とブラウザーをつなぐ中継サービスの3つで構成している。
デーモンはCodexの実行と端末の接続を受け持ち、中継サービスはCloudflare Workers上で認証とGitHub・Linear連携を担当する。

`orield workflow`は、GitHub Issueに書いた要求（WHAT）からLinearに実装計画（HOW）を作る。
計画の作成は読み取り専用で、コードの変更にはLinear Todoでの人の承認と、対象リポジトリの`.oriel.yaml`による実行許可を必要とする。
