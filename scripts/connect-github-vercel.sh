#!/usr/bin/env bash
# Einmal ausführen im Projektordner — öffnet Browser für GitHub + Vercel.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_NAME="${1:-werkstadtforum}"

echo ""
echo "→ Schritt 1/4: GitHub anmelden (Browser öffnet sich)"
gh auth status >/dev/null 2>&1 || gh auth login -h github.com -p https -w

echo ""
echo "→ Schritt 2/4: GitHub-Repo erstellen und Code pushen"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Add Vercel config"
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "   Remote origin existiert bereits — push only"
  git push -u origin main
else
  gh repo create "$REPO_NAME" --source=. --public --remote=origin --push \
    --description "WerkStadtForum – Astro Website"
fi

GITHUB_URL="$(gh repo view --json url -q .url)"
echo "   GitHub: $GITHUB_URL"

echo ""
echo "→ Schritt 3/4: Vercel anmelden (Browser)"
bunx vercel login

echo ""
echo "→ Schritt 4/4: Production-Deploy"
bunx vercel link --yes
DEPLOY_URL="$(bunx vercel deploy --prod --yes 2>&1 | tail -1)"
echo ""
echo "✓ Fertig"
echo "  GitHub:  $GITHUB_URL"
echo "  Vercel:  $DEPLOY_URL"
echo ""
echo "Tipp: In Vercel Dashboard → Project → Settings → Git das GitHub-Repo verbinden für Auto-Deploys."
