param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
  throw "DATABASE_URL must be set in the process environment."
}

$pgDump = Get-Command pg_dump -ErrorAction Stop
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput

if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$previousPgDatabase = $env:PGDATABASE
$env:PGDATABASE = $databaseUrl
try {
  & $pgDump.Source --format=custom --no-owner --no-privileges --file=$resolvedOutput
  if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed with exit code $LASTEXITCODE"
  }
} finally {
  $env:PGDATABASE = $previousPgDatabase
}

$checksum = Get-FileHash -LiteralPath $resolvedOutput -Algorithm SHA256
[pscustomobject]@{
  BackupPath = $resolvedOutput
  Sha256 = $checksum.Hash.ToLowerInvariant()
  Bytes = (Get-Item -LiteralPath $resolvedOutput).Length
}
