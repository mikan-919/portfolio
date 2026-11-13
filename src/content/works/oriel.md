---
title: "Oriel"
category: "web app"
role: "Design / Development"
description: "ローカルのCodexをブラウザーから操作し、GitHub IssueとLinearで開発を進めるツール。"
techStack:
    - "rust"
    - "typescript"
image: "../../assets/images/works/oriel.webp"
tags:
    - "Developer Tools"
    - "AI Agent"
    - "Cloudflare Workers"
github: "https://github.com/mikan-919/oriel"
githubVisibility: "public"
date: 2026-10-05
isComingSoon: false
featured: true
---

利用端末で動くデーモン`orield`、ブラウザーの操作画面、端末とブラウザーをつなぐ中継サービスの3つで構成している。
デーモンはCodexの実行と端末の接続を受け持ち、中継サービスはCloudflare Workers上で認証とGitHub・Linear連携を担当する。

`orield workflow`は、GitHub Issueに書いた要求（WHAT）からLinearに実装計画（HOW）を作る。
計画の作成は読み取り専用で、コードの変更にはLinear Todoでの人の承認と、対象リポジトリの`.oriel.yaml`による実行許可を必要とする。

10月15日に`orield`の0.1.0をcrates.ioへ公開し、自分の開発で常時動かした。
運用中にDurable Objectsの無料枠の読み取り行数を超えたため、エージェントに処理ごとの読み取り行数を測らせた。
全件探索は967行、実行中の1件確認は326行で、実行中の確認を対象の取得に絞ることで読み取りを約66%減らした。
待機中の照合はWebhookで通知を受ける構成にし、1日1,440回から96回に減らしている。

## 自分が決めたこと

- GitHub Issueで要求（WHAT）を書き、Linearで計画（HOW）を決め、PRまで通す流れ。GitHubとLinearを本来の用途どおりに使うとどうなるかを、自分なりに組んで確かめるために作った
- Codexは作業をし、人は内容を認識して判断する、という役割の分け方
- 承認の仕組み。コードの変更には、Linear Todoでの人の承認と、対象リポジトリの`.oriel.yaml`による実行許可の両方を必要にした

## エージェントに任せたこと

- コードの大部分（CodexとClaude）
- 設計判断の記録（ADR）
- 無料枠で止まったときの、処理ごとの読み取り行数の計測と、使用量の試算

止まったことに気づいたのは自分で、Codexの使用量が残っているのにOrielが動かなくなったことがきっかけだった。原因の調査は、エージェントに任せた。
