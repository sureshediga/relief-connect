# Database Migration Script for Windows PowerShell
# This script sets up the environment and runs Prisma db push

Write-Host "🔄 Running database migration..." -ForegroundColor Cyan
Write-Host ""

# Set the direct connection URL (port 5432 for migrations)
# URL encode special characters: $ becomes %24
$env:DATABASE_URL = "postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
$env:DIRECT_URL = "postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"

Write-Host "📦 Pushing schema to database..." -ForegroundColor Yellow
Write-Host ""

# Run Prisma db push
& npx prisma db push --accept-data-loss

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Migration failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

