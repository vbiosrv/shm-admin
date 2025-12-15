#!/usr/bin/env pwsh
# PowerShell build script for Windows

$REPO = "bkeenke"

function Build-And-Push {
    param (
        [string]$ImageName
    )
    
    $Tags = @()
    foreach ($TAG in $script:LABELS) {
        $Tags += "$REPO/${ImageName}:$TAG"
    }
    
    $tagArgs = $Tags | ForEach-Object { "-t", $_ }
    
    Write-Host "Building with tags: $($Tags -join ', ')" -ForegroundColor Cyan
    
    docker build --platform linux/amd64,linux/arm64 `
        $tagArgs .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
    
    foreach ($TAG in $Tags) {
        Write-Host "Pushing $TAG..." -ForegroundColor Green
        docker push $TAG
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Push failed for $TAG!" -ForegroundColor Red
            exit 1
        }
    }
}

# Get git tag
try {
    $GIT_TAG = git describe --abbrev=0 --tags 2>$null
    if (-not $GIT_TAG) {
        $GIT_TAG = "v0.0.0"
        Write-Host "Warning: No git tags found, using $GIT_TAG" -ForegroundColor Yellow
    }
} catch {
    $GIT_TAG = "v0.0.0"
    Write-Host "Warning: Git not available, using $GIT_TAG" -ForegroundColor Yellow
}

$LABELS = @($GIT_TAG)

# Add minor tag
$VERSION_MINOR = ($GIT_TAG -split '\.')[0..1] -join '.'
$LABELS += $VERSION_MINOR

# Add custom tags from arguments
if ($args.Count -gt 0) {
    $LABELS += $args
}

# Get revision
try {
    $REV = git rev-parse --short HEAD 2>$null
    if (-not $REV) {
        $REV = "unknown"
    }
} catch {
    $REV = "unknown"
}

Write-Host "Build version: ${GIT_TAG}-${REV}" -ForegroundColor Cyan
Write-Host "TAGS: $($LABELS -join ', ')" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"

# Create version file if src directory exists
if (Test-Path "src") {
    "${GIT_TAG}-${REV}" | Out-File -FilePath "src/version" -NoNewline -Encoding ASCII
    Write-Host "Version file created: src/version" -ForegroundColor Green
} else {
    Write-Host "Skipping version file creation (src directory not found)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting build..." -ForegroundColor Cyan
Build-And-Push "shm-admin-2"

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
