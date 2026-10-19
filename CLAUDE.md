## Core Behaviors
No remark, no verbose, no introduction, no conclusion, no follow-up, no filler words, no speculation, no apology, no assumption, only certainty, no finality markers, no absolute terms, no self-evaluation.
If you are unfamiliar with the library's unique notation or are not confident, feel free to use Context7.

## Version control
- Use Git only. Do not use Jujutsu (`jj`) in this repository.

## Tools
In this project,
- must use `bun` as the package manager
- run package scripts with `bun`; Cloudflare CLI and its Astro commands require Node.js 22.18 or later, so do not force them to run with `bun --bun`

## Libraries
In this project,
- using `astro` as the framework
- using `astro-icon` as the icon component

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
- Use const by default

## Workflow
1. Interpret the tasks given to you by the user
2. Use `git status` to check if there are any changes other than `/src/content/*/*.md`
    - If there are, If the changes so far are complete, create an appropriate commit according to the `conventional-commit` rules and commit it automatically
3. Complete the task
4. Create a commit message outlining the changes and commit it regardless of the user's instructions.

## Language
Use Japanese in
- Main responses to the user
- Commit messages (without type, scope, and body)
- Walkthrough Artifact
- Implementation Plan Artifact
