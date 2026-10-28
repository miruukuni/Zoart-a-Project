param([ValidateSet('frontend', 'backend')][string]$Service = 'frontend')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$env:PATH = "$projectRoot\.tools\node;$projectRoot\backend\.venv\Scripts;$env:PATH"
if ($Service -eq 'backend') {
    Set-Location "$projectRoot\backend"
    & '.\.venv\Scripts\python.exe' -m uvicorn app.gemini:app --reload --workers 1 --host 127.0.0.1 --port 8000 --no-proxy-headers
} else {
    Set-Location "$projectRoot\zoart-a-project"
    & "$projectRoot\.tools\node\npm.cmd" run dev
}
exit $LASTEXITCODE
