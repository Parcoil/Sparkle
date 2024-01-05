@echo off
setlocal

set ZIP_URL=https://github.com/Parcoil/Sparkle/releases/latest/download/win-unpacked.zip
set ZIP_FILE=%TEMP%\win-unpacked.zip
set EXTRACT_DIR=C:\Users\%USERNAME%\AppData\Local\Programs\sparkle

rem Download the latest ZIP file
curl -L -o "%ZIP_FILE%" "%ZIP_URL%"

rem Check if the download was successful
if %ERRORLEVEL% NEQ 0 (
    echo Failed to download the ZIP file.
    exit /b 1
)

rem Extract the ZIP file to the destination folder
if not exist "%EXTRACT_DIR%" (
    mkdir "%EXTRACT_DIR%"
)
tar -xf "%ZIP_FILE%" -C "%EXTRACT_DIR%"

rem Clean up the temporary ZIP file
del /q "%ZIP_FILE%"

echo Latest release has been downloaded and extracted.

rem Add your existing batch script code here

endlocal
