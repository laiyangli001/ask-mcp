@echo off
REM Windows one-click installer for ask-mcp
node "%~dp0install.mjs"
if errorlevel 1 (
  echo.
  echo Installation failed. See errors above.
) else (
  echo.
  echo Done. Reload Window in VS Code (Ctrl+Shift+P -^> Developer: Reload Window).
)
pause
