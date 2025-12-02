@echo off
REM Database Migration Script for Windows CMD
REM This script sets up the environment and runs Prisma db push

echo 🔄 Running database migration...
echo.

REM Set the direct connection URL (port 5432 for migrations)
REM URL encode special characters: $ becomes %24
set DATABASE_URL=postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public
set DIRECT_URL=postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public

echo 📦 Pushing schema to database...
echo.

REM Run Prisma db push
call npx prisma db push --accept-data-loss

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database migration completed successfully!
) else (
    echo.
    echo ❌ Migration failed. Please check the error messages above.
    exit /b 1
)

