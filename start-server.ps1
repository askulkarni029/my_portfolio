# Simple HTTP server for the portfolio — no installs needed
$port = 3000
$root = $PSScriptRoot

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  Portfolio running at  http://localhost:$port" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

# Open browser automatically
Start-Process "http://localhost:$port"

try {
  while ($listener.IsListening) {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $resp = $ctx.Response

    $urlPath = $req.Url.LocalPath.TrimStart('/')
    if ($urlPath -eq '' -or $urlPath -eq '/') { $urlPath = 'index.html' }

    $filePath = Join-Path $root $urlPath

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $mime = switch ($ext) {
        '.html' { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.svg'  { 'image/svg+xml' }
        '.ico'  { 'image/x-icon' }
        default { 'application/octet-stream' }
      }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $resp.ContentType   = $mime
      $resp.ContentLength64 = $bytes.Length
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $resp.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $resp.OutputStream.Write($body, 0, $body.Length)
    }

    $resp.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
