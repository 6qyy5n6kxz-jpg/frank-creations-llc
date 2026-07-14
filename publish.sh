#!/bin/bash

set -e

if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "A Git rebase is already in progress."
  echo "Run: git rebase --continue"
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "You are currently on branch: $CURRENT_BRANCH"
  echo "Switch to main before publishing:"
  echo "git switch main"
  exit 1
fi

COMMIT_MESSAGE="${1:-Update Frank Creations website}"

echo "Checking repository..."
git status --short

echo "Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "No new local changes to commit."
else
  echo "Creating commit..."
  git commit -m "$COMMIT_MESSAGE"
fi

echo "Syncing with GitHub..."
git pull --rebase --autostash origin main

echo "Publishing to GitHub..."
git push origin main

echo ""
echo "Frank Creations website successfully published."
git log --oneline --decorate -3
