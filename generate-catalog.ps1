$extensions = @(".png", ".jpg", ".jpeg", ".jfif", ".webp")

$items = Get-ChildItem -Path $PSScriptRoot -File |
  Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() -and $_.BaseName.ToLowerInvariant() -ne "logo" } |
  Sort-Object Name |
  Select-Object -First 5 |
  ForEach-Object {
    $normalized = $_.BaseName -replace "[-_]+", " "
    $name = (Get-Culture).TextInfo.ToTitleCase($normalized.ToLowerInvariant())
    [PSCustomObject]@{
      id = $_.BaseName.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
      name = $name
      image = $_.Name
    }
  }

$json = $items | ConvertTo-Json -Depth 2
$content = "window.catalogData = $json;"
Set-Content -LiteralPath (Join-Path $PSScriptRoot "catalog.js") -Value $content -Encoding UTF8
