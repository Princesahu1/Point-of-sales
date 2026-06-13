$ZipFileName = "POS_Project.zip"
$SourceDir = ".\"

# Remove old zip if exists
if (Test-Path $ZipFileName) {
    Remove-Item $ZipFileName -Force
}

# Remove generated directories before zipping to keep file size small
Write-Host "Cleaning project before zipping..." -ForegroundColor Cyan

if (Test-Path ".\frontend\node_modules") {
    Write-Host "Removing frontend\node_modules..."
    Remove-Item -Recurse -Force ".\frontend\node_modules"
}

if (Test-Path ".\backend\target") {
    Write-Host "Removing backend\target..."
    Remove-Item -Recurse -Force ".\backend\target"
}

if (Test-Path ".\frontend\dist") {
    Write-Host "Removing frontend\dist..."
    Remove-Item -Recurse -Force ".\frontend\dist"
}

Write-Host "Creating zip file: $ZipFileName..." -ForegroundColor Cyan

# Zip the directory, excluding the zip file itself and hidden folders like .git
Compress-Archive -Path ".\backend", ".\frontend", ".\docker-compose.yml", ".\README.md" -DestinationPath $ZipFileName -Force

Write-Host "Done! Share the '$ZipFileName' file." -ForegroundColor Green
Write-Host "The other person can run it easily using Docker Compose!" -ForegroundColor Yellow
