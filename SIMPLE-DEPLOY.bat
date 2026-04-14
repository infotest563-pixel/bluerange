@echo off
color 0A
echo.
echo ============================================================
echo    BLUERANGE - SIMPLE DEPLOYMENT SCRIPT
echo ============================================================
echo.
echo This script will deploy your fixes to make all pages work!
echo.
echo WHAT THIS FIXES:
echo   - Home page already works
echo   - Other pages showing 404 errors
echo   - Swedish language pages not working
echo.
echo AFTER DEPLOYMENT, THESE WILL WORK:
echo   - /infrastructure-as-a-service
echo   - /sv/infrastruktur-som-en-tjanst
echo   - /sv/om-bluerange
echo   - All other Swedish and English pages
echo.
echo ============================================================
echo.
pause
echo.

echo [1/4] Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Git is NOT installed!
    echo.
    echo SOLUTION:
    echo 1. Go to: https://git-scm.com/download/win
    echo 2. Download and install Git
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)
echo      Git is installed! [OK]
echo.

echo [2/4] Adding your code changes...
git add .
if errorlevel 1 (
    color 0C
    echo      Failed to add files [ERROR]
    pause
    exit /b 1
)
echo      Files added successfully! [OK]
echo.

echo [3/4] Committing changes...
git commit -m "Fix: Enable all pages and Swedish language routing"
if errorlevel 1 (
    echo      Nothing new to commit (maybe already committed?) [WARNING]
)
echo.

echo [4/4] Pushing to GitHub...
git push
if errorlevel 1 (
    color 0C
    echo      Failed to push [ERROR]
    echo.
    echo POSSIBLE REASONS:
    echo   - GitHub credentials needed
    echo   - No internet connection
    echo   - Repository access denied
    echo.
    pause
    exit /b 1
)
echo      Pushed successfully! [OK]
echo.

color 0A
echo ============================================================
echo    SUCCESS! CODE DEPLOYED TO GITHUB
echo ============================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Go to Vercel Dashboard:
echo    https://vercel.com/demos-projects-e3b4f918/bluerange
echo.
echo 2. Wait 2-3 minutes for deployment to complete
echo    (Status will change from "Building..." to "Ready")
echo.
echo 3. Test your pages:
echo    - https://bluerange-z8sh.vercel.app/infrastructure-as-a-service
echo    - https://bluerange-z8sh.vercel.app/sv/infrastruktur-som-en-tjanst
echo    - https://bluerange-z8sh.vercel.app/sv/om-bluerange
echo.
echo 4. All pages should now work correctly!
echo.
echo ============================================================
echo.
pause
