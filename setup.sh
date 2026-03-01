#!/usr/bin/env bash
#
# ============================================================
#  SponsorMyThing.com — Project Setup Script
# ============================================================
#  This script will:
#    1. Initialize a new Next.js project with Tailwind CSS
#    2. Initialize a local Git repository
#    3. Securely prompt you for credentials
#    4. Generate a .env.local file
#    5. Link your local repo to a remote GitHub URL & push
#
#  Run with:  bash setup.sh
# ============================================================

set -euo pipefail

# ── Colors & Helpers ──────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ╔═══════════════════════════════════════════════╗"
  echo "  ║        🚀  SponsorMyThing.com  Setup         ║"
  echo "  ╚═══════════════════════════════════════════════╝"
  echo -e "${NC}"
}

step() {
  echo -e "\n${GREEN}${BOLD}[$1/5]${NC} ${BOLD}$2${NC}"
}

info() {
  echo -e "  ${CYAN}→${NC} $1"
}

warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
}

success() {
  echo -e "\n${GREEN}${BOLD}✅  $1${NC}"
}

error_exit() {
  echo -e "\n${RED}${BOLD}❌  Error: $1${NC}" >&2
  exit 1
}

# ── Pre-flight Checks ────────────────────────────────────────
check_dependencies() {
  local missing=()
  for cmd in node npm npx git; do
    if ! command -v "$cmd" &> /dev/null; then
      missing+=("$cmd")
    fi
  done

  if [ ${#missing[@]} -ne 0 ]; then
    error_exit "Missing required tools: ${missing[*]}. Please install them and try again."
  fi

  local node_version
  node_version=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$node_version" -lt 18 ]; then
    error_exit "Node.js 18+ is required. You have $(node -v)."
  fi
}

# ── Main Script ───────────────────────────────────────────────
banner
check_dependencies
info "All dependencies verified (node $(node -v), npm $(npm -v), git $(git --version | cut -d' ' -f3))"

# ─────────────────────────────────────────────────────────────
# STEP 1: Securely Collect Credentials
# ─────────────────────────────────────────────────────────────
step 1 "Collecting your credentials (input is hidden for secrets)"

echo ""
echo -e "  ${BOLD}Supabase Configuration${NC}"
read -rp "  Supabase Project URL: " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then error_exit "Supabase URL cannot be empty."; fi

read -rsp "  Supabase Anon Key (hidden): " SUPABASE_ANON_KEY
echo ""
if [ -z "$SUPABASE_ANON_KEY" ]; then error_exit "Supabase Anon Key cannot be empty."; fi

echo ""
echo -e "  ${BOLD}GitHub Configuration${NC}"
read -rp "  GitHub Remote Repository URL: " GITHUB_REMOTE_URL
if [ -z "$GITHUB_REMOTE_URL" ]; then error_exit "GitHub Remote URL cannot be empty."; fi

echo ""
echo -e "  ${BOLD}GoDaddy Configuration${NC}"
read -rsp "  GoDaddy API Key (hidden): " GODADDY_API_KEY
echo ""
if [ -z "$GODADDY_API_KEY" ]; then error_exit "GoDaddy API Key cannot be empty."; fi

read -rsp "  GoDaddy API Secret (hidden): " GODADDY_API_SECRET
echo ""
if [ -z "$GODADDY_API_SECRET" ]; then error_exit "GoDaddy API Secret cannot be empty."; fi

success "Credentials collected securely."

# ─────────────────────────────────────────────────────────────
# STEP 2: Scaffold Next.js with Tailwind CSS
# ─────────────────────────────────────────────────────────────
step 2 "Scaffolding Next.js project with Tailwind CSS..."

info "Running create-next-app (this may take a minute)..."

npx -y create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-turbopack

if [ $? -ne 0 ]; then
  error_exit "Next.js project creation failed."
fi

success "Next.js project scaffolded successfully."

# ─────────────────────────────────────────────────────────────
# STEP 3: Generate .env.local
# ─────────────────────────────────────────────────────────────
step 3 "Generating .env.local file..."

cat > .env.local << EOF
# ============================================================
#  SponsorMyThing.com — Environment Variables
#  Generated on: $(date '+%Y-%m-%d %H:%M:%S')
#
#  ⚠️  DO NOT COMMIT THIS FILE TO VERSION CONTROL
# ============================================================

# ── Supabase ─────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# ── GoDaddy ──────────────────────────────────────────────────
GODADDY_API_KEY=${GODADDY_API_KEY}
GODADDY_API_SECRET=${GODADDY_API_SECRET}

# ── Google Maps / Places API (add your key when ready) ───────
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# ── LLM / AI Provider (add your key when ready) ─────────────
# OPENAI_API_KEY=

# ── Email API (add your key when ready) ──────────────────────
# RESEND_API_KEY=
EOF

info ".env.local created with your credentials."

# ─────────────────────────────────────────────────────────────
# STEP 4: Ensure .gitignore covers secrets
# ─────────────────────────────────────────────────────────────
step 4 "Verifying .gitignore covers sensitive files..."

# Next.js ships a .gitignore, but let's make sure .env.local is in it
if [ -f .gitignore ]; then
  if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Environment variables (secrets)" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env*.local" >> .gitignore
    info "Added .env.local to .gitignore."
  else
    info ".gitignore already covers .env.local — good."
  fi
else
  cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment variables (secrets)
.env.local
.env*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
GITIGNORE
  info "Created .gitignore with standard entries."
fi

success ".gitignore is configured to protect your secrets."

# ─────────────────────────────────────────────────────────────
# STEP 5: Initialize Git, Link Remote, and Push
# ─────────────────────────────────────────────────────────────
step 5 "Initializing Git and pushing to GitHub..."

# Initialize if not already a git repo
if [ ! -d .git ]; then
  git init
  info "Git repository initialized."
else
  info "Git repository already exists."
fi

# Stage all files
git add -A
info "All files staged."

# Initial commit
git commit -m "🎉 Initial commit — SponsorMyThing.com scaffold

- Next.js 14+ with App Router and TypeScript
- Tailwind CSS configured
- ESLint enabled
- Supabase integration ready
- .env.local template generated (not committed)"

info "Initial commit created."

# Add remote and push
git remote add origin "$GITHUB_REMOTE_URL" 2>/dev/null || \
  git remote set-url origin "$GITHUB_REMOTE_URL"
info "Remote 'origin' set to: $GITHUB_REMOTE_URL"

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
  success "Code pushed to GitHub successfully!"
else
  warn "Push failed — check your GitHub URL and authentication."
  warn "You can push manually later with: git push -u origin main"
fi

# ── Final Summary ─────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║          🎉  Setup Complete!                  ║"
echo "  ╠═══════════════════════════════════════════════╣"
echo "  ║                                               ║"
echo "  ║  Next steps:                                  ║"
echo "  ║    1. cd into your project directory           ║"
echo "  ║    2. Run:  npm run dev                       ║"
echo "  ║    3. Open: http://localhost:3000              ║"
echo "  ║                                               ║"
echo "  ║  Add remaining API keys to .env.local:        ║"
echo "  ║    • NEXT_PUBLIC_GOOGLE_MAPS_API_KEY          ║"
echo "  ║    • OPENAI_API_KEY                           ║"
echo "  ║    • RESEND_API_KEY                           ║"
echo "  ║                                               ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
