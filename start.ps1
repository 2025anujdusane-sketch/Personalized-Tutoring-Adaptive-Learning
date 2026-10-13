Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting StudySphere AI — Backend & Frontend Services" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend on port 8000
$backendPython = ".\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $backendPython)) {
    $backendPython = "python"
}

$env:PYTHONPATH = "backend"

Write-Host "Launching FastAPI backend on http://localhost:8000..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath $backendPython -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory $PSScriptRoot -PassThru

# 2. Start Frontend Dev Server on port 3000
Write-Host "Launching Vite frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "./node_modules/vite/bin/vite.js --port=3000 --host=0.0.0.0" -WorkingDirectory $PSScriptRoot

Write-Host "`nBoth services launched!" -ForegroundColor Yellow
Write-Host "  - Frontend UI:  http://localhost:3000" -ForegroundColor White
Write-Host "  - API Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  - OpenAPI Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nPress Ctrl+C or close windows to terminate." -ForegroundColor Gray
