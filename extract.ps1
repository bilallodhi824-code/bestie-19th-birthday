Add-Type -AssemblyName System.IO.Compression.FileSystem
$docPath = Join-Path $PSScriptRoot "Conversation with Gemini.docx"
$outPath = Join-Path $PSScriptRoot "extracted_raw_text.txt"

$zip = [System.IO.Compression.ZipFile]::OpenRead($docPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

[xml]$doc = $xmlText
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$paras = $doc.SelectNodes("//w:p", $ns)
$textList = [System.Collections.Generic.List[string]]::new()
foreach ($p in $paras) {
    $tNodes = $p.SelectNodes(".//w:t", $ns)
    $sb = [System.Text.StringBuilder]::new()
    foreach ($t in $tNodes) {
        [void]$sb.Append($t.InnerText)
    }
    $line = $sb.ToString().Trim()
    if ($line.Length -gt 0) {
        $textList.Add($line)
    }
}
$full = [string]::Join("`r`n`r`n", $textList)
[System.IO.File]::WriteAllText($outPath, $full, [System.Text.Encoding]::UTF8)
Write-Host "Total non-empty paragraphs: " $textList.Count
Write-Host "Total character length: " $full.Length
Write-Host "Word count estimate: " ($full.Split([char[]]@(' ','`t','`n','`r'), [StringSplitOptions]::RemoveEmptyEntries).Length)
