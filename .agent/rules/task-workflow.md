---
trigger: always_on
---

## Workflow
1. Interpret the tasks given to you by the user
2. Use `git status` to check if there are any changes other than `/src/content/*/*.md`
    - If there are, If the changes so far are complete, create an appropriate commit according to the `conventional-commit` rules and commit it automatically
3. Complete the task
4. Create a commit message outlining the changes and commit it regardless of the user's instructions.
