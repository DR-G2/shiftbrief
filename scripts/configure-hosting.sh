#!/usr/bin/env bash
# Copy the Hosting template and set a personal Firebase project ID.
# Usage: ./scripts/configure-hosting.sh YOUR_PERSONAL_FIREBASE_PROJECT_ID
# Then, after `firebase login` on your machine: npm run hosting:deploy
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT_ID="${1:-}"
if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "YOUR_PERSONAL_FIREBASE_PROJECT_ID" ]]; then
  echo "Usage: $0 YOUR_PERSONAL_FIREBASE_PROJECT_ID" >&2
  exit 1
fi
sed "s/YOUR_PERSONAL_FIREBASE_PROJECT_ID/${PROJECT_ID}/" .firebaserc.example > .firebaserc
echo "Wrote .firebaserc with project ${PROJECT_ID} (project id only; safe to commit)."
echo "Next: firebase login   # if needed"
echo "      npm run hosting:deploy"
