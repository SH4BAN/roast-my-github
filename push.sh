#!/bin/sh
git config user.email "agent@replit.com"
git config user.name "Replit Agent"
git remote remove origin 2>/dev/null
git remote add origin "https://${GITHUB_TOKEN}@github.com/SH4BAN/roast-my-github.git"
git branch -M main
git push -u origin main --force
echo "Done!"
