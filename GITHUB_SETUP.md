# GitHub Setup Instructions

## Option 1: Create Repo via GitHub Website (Recommended)

1. Go to https://github.com/new
2. Repository name: `craft-chain`
3. Description: "Handmade & Vintage Marketplace with NFT proof of ownership"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then run these commands:

```bash
cd /Users/mo/craft-chain
git remote add origin https://github.com/YOUR_USERNAME/craft-chain.git
git push -u origin main
```

## Option 2: Create Repo via GitHub CLI (if installed)

```bash
cd /Users/mo/craft-chain
gh repo create craft-chain --public --source=. --remote=origin --push
```

## Option 3: Manual Push (if repo already exists)

```bash
cd /Users/mo/craft-chain
git remote add origin https://github.com/YOUR_USERNAME/craft-chain.git
git branch -M main
git push -u origin main
```

## Verify

After pushing, verify with:
```bash
git remote -v
git log --oneline
```

