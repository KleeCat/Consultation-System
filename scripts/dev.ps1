param(
  [switch]$SeedDemoData
)

if ($SeedDemoData) {
  Write-Host "Seeding demo data..."
  uv run python .\scripts\seed_demo_data.py
}

Write-Host "Starting backend and frontend dev servers..."
Start-Process powershell -ArgumentList "-NoProfile", "-Command", "uv run uvicorn backend.app.main:app --reload" -WindowStyle Hidden
Start-Process powershell -ArgumentList "-NoProfile", "-Command", "npm --prefix frontend run dev" -WindowStyle Hidden
