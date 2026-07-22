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

    try {
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
        '.mp4'  { 'video/mp4' }
        '.webm' { 'video/webm' }
        default { 'application/octet-stream' }
      }

      $fileLength = (Get-Item $filePath).Length
      $rangeHeader = $req.Headers['Range']

      if ($rangeHeader -and $rangeHeader -match 'bytes=(\d*)-(\d*)') {
        $start = if ($matches[1]) { [int64]$matches[1] } else { 0 }
        $end   = if ($matches[2]) { [int64]$matches[2] } else { $fileLength - 1 }
        $end   = [Math]::Min($end, $fileLength - 1)
        $chunkLength = $end - $start + 1

        $resp.StatusCode = 206
        $resp.ContentType = $mime
        $resp.Headers.Add('Accept-Ranges', 'bytes')
        $resp.Headers.Add('Content-Range', "bytes $start-$end/$fileLength")
        $resp.ContentLength64 = $chunkLength

        $stream = [System.IO.File]::OpenRead($filePath)
        $stream.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
        $buffer = New-Object byte[] 65536
        $remaining = $chunkLength
        while ($remaining -gt 0) {
          $toRead = [Math]::Min($buffer.Length, $remaining)
          $read = $stream.Read($buffer, 0, $toRead)
          if ($read -le 0) { break }
          $resp.OutputStream.Write($buffer, 0, $read)
          $remaining -= $read
        }
        $stream.Close()
      } else {
        $resp.ContentType   = $mime
        $resp.Headers.Add('Accept-Ranges', 'bytes')
        $resp.ContentLength64 = $fileLength
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $resp.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $resp.OutputStream.Write($body, 0, $body.Length)
    }
    } catch {
      # Client disconnected mid-response or another per-request error — skip it, keep the server alive
    } finally {
      $resp.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
}
