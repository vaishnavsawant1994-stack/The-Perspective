param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
)

$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
  throw "DATABASE_URL must reference a separately created empty restore target."
}

$pgRestore = Get-Command pg_restore -ErrorAction Stop
$resolvedBackup = [System.IO.Path]::GetFullPath($BackupPath)

if (-not (Test-Path -LiteralPath $resolvedBackup -PathType Leaf)) {
  throw "Backup file does not exist: $resolvedBackup"
}

$previousPgDatabase = $env:PGDATABASE
$env:PGDATABASE = $databaseUrl
try {
  & $pgRestore.Source --exit-on-error --no-owner --no-privileges $resolvedBackup
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore failed with exit code $LASTEXITCODE"
  }
} finally {
  $env:PGDATABASE = $previousPgDatabase
}

npm run db:verify
if ($LASTEXITCODE -ne 0) {
  throw "Restored database verification failed with exit code $LASTEXITCODE"
}
