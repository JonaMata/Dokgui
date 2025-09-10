import {dokkuClient} from "~~/server/utils/dokku";

export default defineEventHandler(async (event) => {
    const run = dokkuClient()
    const {name} = event.context.params as { name: string }
    const infoResult = await run(`apps:report ${name}`).result.catch(console.error)
    if (!infoResult) {
        throw createError({
            statusCode: 404,
            statusMessage: `App ${name} not found`
        })
    }
    const infoLines = (infoResult as string).split('\n').slice(0, -1)
    const info: Record<string, string | boolean> = {}
    infoLines.forEach(line => {
        const [key, ...valueParts] = line.split(':')
        let value: string | boolean = valueParts.join(':').trim()
        if (value === 'true') value = true
        else if (value === 'false') value = false
        info[key.trim()] = value
    })
    return info
})
