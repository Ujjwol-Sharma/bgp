param(
    [int]$Port = 5500,
    [string]$Root = $PSScriptRoot
)

$listener = $null
for ($p = $Port; $p -lt ($Port + 20); $p++) {
    try {
        $endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Loopback, $p)
        $candidate = New-Object System.Net.Sockets.TcpListener($endpoint)
        $candidate.Start()
        $listener = $candidate
        $Port = $p
        break
    } catch {
        continue
    }
}

if (-not $listener) {
    throw "Could not bind to any port in range."
}
Write-Output "BPG Maths Academy running at http://localhost:$Port/ (Admin Studio: http://localhost:$Port/admin.html)"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if (-not [string]::IsNullOrWhiteSpace($requestLine)) {
                while ($true) {
                    $headerLine = $reader.ReadLine()
                    if ([string]::IsNullOrEmpty($headerLine)) { break }
                }
                $parts = $requestLine.Split(' ')
                $rawPath = if ($parts.Length -ge 2) { $parts[1].Split('?')[0] } else { "/" }
                $relPath = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/'))
                if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
                if ($relPath -eq "admin") { $relPath = "admin.html" }

                $filePath = Join-Path $Root ($relPath -replace '/', '\')
                if (Test-Path $filePath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                    $bodyBytes = [System.IO.File]::ReadAllBytes($filePath)
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bodyBytes.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
                } else {
                    $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($notFound.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($notFound, 0, $notFound.Length)
                }
                $stream.Flush()
            }
        } catch {
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
