@echo off
cd /d "c:\Users\Lenovo\Downloads\GitHub Cloned Repos\Malik-Test"
"C:\Program Files\Git\cmd\git.exe" rm -r --cached eduresource-api/dist frontend/dist 2>nul || echo no-tracked-dist
rd /s /q "c:\Users\Lenovo\Downloads\GitHub Cloned Repos\Malik-Test\eduresource-api\dist" 2>nul || echo no-eduresource-dist
rd /s /q "c:\Users\Lenovo\Downloads\GitHub Cloned Repos\Malik-Test\frontend\dist" 2>nul || echo no-frontend-dist
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "chore: remove build artifacts (dist), update seed & school info" || echo NO_CHANGES
"C:\Program Files\Git\cmd\git.exe" push
