# Cleritas Pharma - Clear Labeled Vitamins

Professional vitamin solutions for women, families, and children. Pharmaceutical-grade supplements with transparent labeling.

## 🚀 Deployment Options

### Option 1: GitHub + Cloudflare Pages (Recommended - Free)
1. Push to GitHub repository
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Click "Create a project" → "Connect to Git"
4. Select your GitHub repository
5. Build settings: 
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: (leave empty for root)
6. Add secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
7. Deploy! Auto-deploys on push to main branch

### Option 2: GitHub Pages (Free)
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select source: Deploy from a branch
4. Choose main branch and / (root)
5. Your site will be live at `https://username.github.io/cleritas-landing`

### Option 3: Netlify (Free)
1. Drag and drop this folder to [netlify.com](https://netlify.com)
2. Or connect your GitHub repository
3. Automatic deployments on push

### Option 4: Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in this directory
3. Follow prompts

## 📁 Project Structure
```
cleritas-landing/
├── index.html          # Main homepage
├── styles.css          # Optimized styles
├── main.js            # Enhanced JavaScript
├── assets/            # Images and media
└── functions/         # Backend functions (if needed)
```

## ✨ Features
- 🌍 Bilingual (English/Somali)
- 🛒 Shopping cart with localStorage
- 📱 Fully responsive
- ♿ WCAG accessible
- 🔍 SEO optimized
- ⚡ Performance optimized

## 🎯 Quick Deploy

### GitHub + Cloudflare Pages
```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/username/cleritas-landing.git
git push -u origin main
```

Then connect repo to Cloudflare Pages for auto-deploys.

## 🔧 Local Development
```bash
# Python 3
python -m http.server 8000

# Node.js (if installed)
npx serve .

# Then visit http://localhost:8000
```

## 📧 Contact
- **General**: info@cleritaspharma.com
- **Business**: ab@cleritaspharma.com
- **Orders**: orders@cleritaspharma.com

---

© 2025 Cleritas Pharma. All rights reserved.
