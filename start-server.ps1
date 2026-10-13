<#
.SYNOPSIS
Ege Lab - Yerel Web Sunucusu (PWA Testi İçin)
Harici hiçbir araç (Node/Python) gerektirmeden saf PowerShell ile yerel sunucu başlatır.
#>

$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🚀 EGE LAB YEREL SUNUCUSU BAŞLATILDI!" -ForegroundColor Green
    Write-Host "Adres: $prefix" -ForegroundColor Yellow
    Write-Host "PWA ve Çevrimdışı (Offline) Modu Aktif!" -ForegroundColor Green
    Write-Host "Durdurmak için Ctrl + C tuşlarına basın." -ForegroundColor Gray
    Write-Host "==========================================" -ForegroundColor Cyan

    Start-Process $prefix

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) {
            $path = "index.html"
        }

        $filePath = Join-Path $root $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Dosya Bulunamadi")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Sunucu sonlandırıldı: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
}
