# Development Server Startup Script
# This script ensures the backend starts before the frontend to avoid connection issues

Write-Host "🚀 Starting E-Commerce Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory and start backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
Set-Location -Path ".\backend"

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait for backend to be ready
Write-Host "⏳ Waiting for backend to be ready..." -ForegroundColor Yellow
$backendReady = $false
$maxAttempts = 30
$attempt = 0

while (-not $backendReady -and $attempt -lt $maxAttempts) {
    try {
        $attempt++
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

Write-Host ""

if (-not $backendReady) {
    Write-Host "⚠️  Backend did not start within 30 seconds. Starting frontend anyway..." -ForegroundColor Yellow
} else {
    Write-Host "🎉 Backend ready in $attempt seconds" -ForegroundColor Green
}

# Change to frontend directory and start frontend
Write-Host ""
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Set-Location -Path "..\frontend"

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Return to root directory
Set-Location -Path ".."

Write-Host ""
Write-Host "✨ Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access your application at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
