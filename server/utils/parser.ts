export const linesToRecord = (lines: string[]): Record<string, string> => {
    const info: Record<string, string> = {}
    for (const line of lines) {
        const splits = line.split(':')
        const key = splits.shift()!.trim()
        info[key] = splits.join(':').trim()
    }
    return info
}