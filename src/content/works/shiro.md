---
title: "shiro"
category: "web app"
role: "Design / Development"
description: "最大4体のエージェントが非同期に会話へ参加する、Bun製のローカルAIチャット／コーディングエージェント。"
techStack:
    - "typescript"
    - "bun"
    - "react"
tags:
    - "AI Agent"
    - "Multi Agent"
    - "Chat"
github: "https://github.com/mikan-919/shiro"
githubVisibility: "public"
date: 2026-11-09
isComingSoon: false
---

ブラウザーから会話し、ファイル操作やシェルコマンドの実行を依頼できるローカル向けのエージェント。
メッセージアプリ形式の画面で、エージェントは吹き出しを送り、絵文字のリアクションを付ける。

DeLMに着想を得て、未確保のタスクの数に応じて最大4体のエージェントが起動し、共有ノートとタスクキューで分担して同じチャットに発言する。
会話をまたいで残す事実は`settle`ツールで記録し、以後の会話に渡す。

ターンの終了後には観察者がそのターンを読み、既存の型で表せず自由文に歪めて書かれた状態（type-gap）を報告する。
会話履歴はSQLiteに保存する。
