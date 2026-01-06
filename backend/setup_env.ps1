# PowerShell script to create .env file
# Run this script: .\setup_env.ps1

$envContent = @"
MONGO_URI=mongodb+srv://immanuel2k4_db_user:159357@cluster0.wlvrwna.mongodb.net/event_management?retryWrites=true&w=majority
SECRET_KEY=DVL9yIMpRMgi1ioMe5mFaDtrneKrO-Ti5FKuqBAGUWo
"@

$envPath = Join-Path $PSScriptRoot ".env"
# Remove BOM by using UTF8NoBOM encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envPath, $envContent.Split("`n"), $utf8NoBom)

Write-Host "✅ .env file created successfully at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Contents:"
Get-Content $envPath
Write-Host ""
Write-Host "Now run: python check_backend.py" -ForegroundColor Yellow

