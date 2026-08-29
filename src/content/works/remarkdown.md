---
title: "remarkdown"
category: "web app"
role: "Design / Development"
description: "Markdownの記法とコードブロックを保ちながら、8言語へリアルタイム翻訳できる左右分割エディタ。"
techStack:
    - "nextjs"
    - "react"
    - "typescript"
tags:
    - "Markdown"
    - "Translation"
    - "Gemini"
github: "https://github.com/mikan-919/remarkdown"
date: 2026-08-26
isComingSoon: false
---

左側へMarkdownを入力すると、構造を保った翻訳結果を右側へ表示するWebアプリ。
コードブロックを翻訳対象から外し、見出しやリストなどの記法を壊さずに、日本語・英語を含む8言語へ変換できる。

Monaco Editorによる編集体験、入力言語の自動判定、翻訳先の切り替え、結果のコピーに対応。
Gemini APIへのリクエストはServer Actionsに閉じ込め、デバウンスとレート制限で連続入力時の呼び出しを抑えている。
