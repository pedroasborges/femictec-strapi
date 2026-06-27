param(
  [string]$EnvPath = ".env",
  [string]$Uri = "http://localhost:1337/api/femictec/external-projects/sync",
  [int]$PageSize = 50,
  [int]$MaxPages = 1000,
  [bool]$SyncResults = $true,
  [int]$TimeoutSec = 60
)

$ErrorActionPreference = "Stop"

function Read-DotEnvValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Key
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Arquivo .env nao encontrado em '$Path'."
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()

    if (-not $trimmed -or $trimmed.StartsWith("#")) {
      continue
    }

    if ($trimmed -notmatch "^\s*([^=]+?)=(.*)$") {
      continue
    }

    $entryKey = $matches[1].Trim()
    if ($entryKey -ne $Key) {
      continue
    }

    $value = $matches[2].Trim()
    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    elseif ($value.Length -ge 2 -and $value.StartsWith("'") -and $value.EndsWith("'")) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    return $value
  }

  return $null
}

$secret = Read-DotEnvValue -Path $EnvPath -Key "FEMICTEC_SYNC_SECRET"
if (-not $secret) {
  throw "FEMICTEC_SYNC_SECRET nao encontrado em '$EnvPath'."
}

$body = @{
  pageSize = $PageSize
  maxPages = $MaxPages
  syncResults = $SyncResults
} | ConvertTo-Json -Compress

try {
  $response = Invoke-RestMethod -Method Post `
    -Uri $Uri `
    -Headers @{
      "x-femictec-sync-secret" = $secret
    } `
    -ContentType "application/json" `
    -Body $body `
    -TimeoutSec $TimeoutSec
}
catch {
  $webException = $_.Exception
  $statusCode = $null

  if ($webException.Response -and $webException.Response.StatusCode) {
    $statusCode = [int]$webException.Response.StatusCode
  }

  if ($webException -is [System.Net.WebException]) {
    throw @"
Nao foi possivel conectar ao Strapi em '$Uri'.

Verifique:
- se o backend esta rodando;
- se a porta 1337 esta correta;
- se a URL do endpoint esta acessivel;
- se o comando 'npm run dev' ou 'npm run start' ja foi iniciado.
"@
  }

  if ($statusCode -eq 401) {
    throw "Strapi respondeu 401. O valor de FEMICTEC_SYNC_SECRET do .env nao bate com o segredo configurado no backend."
  }

  throw
}

$response | ConvertTo-Json -Depth 10
