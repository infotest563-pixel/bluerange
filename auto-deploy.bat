@echo off
git add .
git commit -m "Fix: Uncomment About.tsx JSX content to resolve Vercel build error"
git push
echo Deployment complete! Check Vercel dashboard.
