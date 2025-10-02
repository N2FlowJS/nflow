# Fix legacy exports in node packages
$packagesDir = "d:\git\nflow\packages"
$fixedCount = 0

Get-ChildItem -Path $packagesDir -Directory | ForEach-Object {
    $indexFile = Join-Path $_.FullName "index.ts"
    if (Test-Path $indexFile) {
        $content = Get-Content $indexFile -Raw
        
        # Check if it has legacy plugin imports
        if ($content -match "import.*from\s+['\"]\./(plugin|generate|begin)") {
            $packageName = $_.Name
            $pascalName = (Get-Culture).TextInfo.ToTitleCase($packageName) -replace '-',''
            
            Write-Host "Fixing: $packageName" -ForegroundColor Cyan
            
            # Create new content
            $newContent = @"
// NodeDefinition export
export { ${pascalName}NodeDefinition } from './definition';
export { default as ${pascalName}Node } from './definition';
export { ${pascalName}NodeDefinition as default } from './definition';
"@
            
            # Check if file has more content after exports
            if ($content -match "(?ms)// Re-export types(.+)") {
                $afterContent = $matches[1]
                $newContent += "`n`n// Re-export types" + $afterContent
            }
            
            Set-Content -Path $indexFile -Value $newContent -NoNewline
            $fixedCount++
        }
    }
}

Write-Host "`nFixed $fixedCount package exports" -ForegroundColor Green
