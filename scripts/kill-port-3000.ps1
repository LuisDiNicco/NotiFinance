# Script to kill any process using port 3000
# This is useful when the backend fails to start due to port already in use

$port = 3000
$processInfo = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processInfo) {
    Write-Host "Found process(es) using port $port" -ForegroundColor Yellow
    foreach ($pid in $processInfo) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
            Stop-Process -Id $pid -Force
            Write-Host "Process killed successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Port $port is free" -ForegroundColor Green
}
