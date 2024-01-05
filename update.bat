@echo off
setlocal enabledelayedexpansion

REM Replace with your GitHub repository information
set repo_owner=Parcoil
set repo_name=Sparkle

REM Get the latest release information from the GitHub API
for /f "usebackq tokens=2 delims=: " %%a in (`curl -s https://api.github.com/repos/%repo_owner%/%repo_name%/releases/latest ^| findstr "tag_name"`) do (
    set latest_release=%%a
)

REM Check if the latest release is newer than the current installation
if not exist "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\version.txt" (
    set /a newer=1
) else (
    for /f "usebackq delims=" %%i in ("C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\version.txt") do (
        set installed_version=%%i
        if "!latest_release!" gtr "!installed_version!" (
            set /a newer=1
        ) else (
            set /a newer=0
        )
    )
)

REM If a newer release is available, download and extract it
if !newer! equ 1 (
    echo Downloading and extracting the latest release...
    curl -L -o "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\latest.zip" "https://github.com/%repo_owner%/%repo_name%/releases/latest/download/win-unpacked.zip"
    if not errorlevel 1 (
        mkdir "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\temp"
        tar -xf "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\latest.zip" -C "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\temp"
        move /y "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\temp\*.*" "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\"
        rmdir /s /q "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\temp"
        echo !latest_release! > "C:\Users\%USERNAME%\AppData\Local\Programs\sparkle\version.txt"
        echo Latest release has been downloaded and extracted.
    ) else (
        echo Failed to download the latest release.
    )
)

endlocal
