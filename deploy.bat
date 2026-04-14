@echo off
echo ========================================
echo Bluerange Deployment Script
echo ========================================
echo.

echo Step 1: Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo After installing, restart this script.
    pause
    exit /b 1
)
echo Git is installed!
echo.

echo Step 2: Adding changes to Git...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo Files added successfully!
echo.

echo Step 3: Committing changes...
git commit -m "Fix Swedish and English page routing - add trailing slash removal and Swedish slug mappings"
if errorlevel 1 (
    echo WARNING: Nothing to commit or commit failed
    echo This might mean there are no changes to deploy
)
echo.

echo Step 4: Pushing to GitHub...
git push
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    echo Please check your GitHub credentials
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Vercel will now automatically deploy your changes.
echo.
echo Next steps:
echo 1. Go to: https://vercel.com/demos-projects-e3b4f918/bluerange
echo 2. Wait 2-3 minutes for deployment to complete
echo 3. Test your pages:
echo    - https://bluerange-z8sh.vercel.app/infrastructure-as-a-service
echo    - https://bluerange-z8sh.vercel.app/sv/infrastruktur-som-en-tjanst
echo    - https://bluerange-z8sh.vercel.app/sv/om-bluerange
echo.
pause
