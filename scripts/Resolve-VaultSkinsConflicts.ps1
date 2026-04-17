param(
  [string]$MainBranch = "origin/main"
)

$ErrorActionPreference = "Stop"

Write-Host "Fetching latest refs..." -ForegroundColor Cyan
git fetch --all --prune

Write-Host "Merging $MainBranch into current branch..." -ForegroundColor Cyan
git merge $MainBranch

if ($LASTEXITCODE -eq 0) {
  Write-Host "No conflicts found. Merge completed." -ForegroundColor Green
  exit 0
}

Write-Host "Conflicts detected. Resolving key VaultSkins files by keeping current branch versions..." -ForegroundColor Yellow

$criticalFiles = @(
  "README.md",
  "backend/src/config/env.js",
  "backend/src/middleware/auth.js",
  "backend/src/middleware/validate.js",
  "backend/src/routes/auth.routes.js",
  "backend/src/routes/listings.routes.js",
  "backend/src/routes/misc.routes.js",
  "backend/src/services/db.js",
  "backend/src/server.js",
  "frontend/src/App.jsx",
  "frontend/src/services/api.js"
)

foreach ($file in $criticalFiles) {
  if (Test-Path $file) {
    git checkout --ours -- $file
    git add $file
    Write-Host "  kept ours: $file" -ForegroundColor DarkYellow
  }
}

$markers = git diff --name-only --diff-filter=U
if ($markers) {
  Write-Host "Still unresolved files:" -ForegroundColor Red
  $markers | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  Write-Host "Resolve these manually, then run: git add <files> && git commit" -ForegroundColor Red
  exit 1
}

Write-Host "All conflicts resolved. Creating merge commit..." -ForegroundColor Green
git commit -m "Resolve main merge conflicts for VaultSkins critical runtime files"
Write-Host "Done. Push your branch now." -ForegroundColor Green
