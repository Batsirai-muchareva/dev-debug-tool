export function getUpdatedLines(originalJson: any, updatedJson: any) {
    if ( ! updatedJson ) {
        return [];
    }

    const originalString = JSON.stringify(originalJson, null, 4);
    const updatedString = JSON.stringify(updatedJson, null, 4);

    const originalLines = originalString.split('\n');
    const updatedLines = updatedString.split('\n');
    const changes = [];

    const maxLines = Math.max(originalLines.length, updatedLines.length);

    for (let i = 0; i < maxLines; i++) {
        const origLine = originalLines[i] || '';
        const updLine = updatedLines[i] || '';

        const origTrimmed = origLine.trim();
        const updTrimmed = updLine.trim();

        if (origTrimmed !== updTrimmed) {
            const lineNumber = i + 1;
            const highlightRange = getHighlightRange(updatedLines, i);

            changes.push({
                lineNumber,
                original: origLine,
                updated: updLine,
                highlightRange // Array of line numbers to highlight
            });
        }
    }

    return changes;
}

function getHighlightRange(lines: string[], changedLineIndex: number): number[] {
    let startLine = changedLineIndex;
    let endLine = changedLineIndex;
    let typeLineIndex = -1;

    // Look backwards to find the $$type line first
    for (let i = changedLineIndex - 1; i >= 0; i--) {
        if (!lines[i]) continue;
        const line = lines[i].trim();

        // Found $$type
        if (line.includes('"$$type"')) {
            typeLineIndex = i;
            break;
        }
    }

    // If we found $$type, now look for the key (property name) above it
    if (typeLineIndex !== -1) {
        for (let i = typeLineIndex - 1; i >= 0; i--) {
            if (!lines[i]) continue;
            const line = lines[i].trim();

            // Found a property key with opening brace (e.g., "color": {)
            if (line.match(/^"[^"]+"\s*:\s*\{/)) {
                startLine = i;
                break;
            }

            // Found just opening brace, keep looking back for the key
            if (line === '{') {
                continue;
            }

            // Found a property key (line ends with comma or is just the key)
            if (line.match(/^"[^"]+"\s*:/)) {
                startLine = i;
                break;
            }
        }
    } else {
        // No $$type found, just use the changed line as start
        startLine = changedLineIndex;
    }

    // Look forwards to find the closing brace
    let braceCount = 0;
    let foundOpenBrace = false;

    for (let i = startLine; i < lines.length; i++) {
        if (!lines[i]) continue;
        const line = lines[i].trim();

        // Count braces
        if (line.includes('{')) {
            braceCount += (line.match(/{/g) || []).length;
            foundOpenBrace = true;
        }
        if (line.includes('}')) {
            braceCount -= (line.match(/}/g) || []).length;
        }

        // When we've closed all braces, we've found the end
        if (foundOpenBrace && braceCount === 0) {
            endLine = i;
            break;
        }
    }

    // Convert to line numbers (1-indexed) and return range
    const range: number[] = [];
    for (let i = startLine; i <= endLine; i++) {
        range.push(i + 1); // +1 because line numbers are 1-indexed
    }

    return range;
}
