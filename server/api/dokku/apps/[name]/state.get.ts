import {dokkuClient} from "~~/server/utils/dokku";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const run = dokkuClient()
    const {name} = event.context.params as { name: string }
    const stateResult = await run(`ps:report ${name}`).result.catch(console.error)
    if (!stateResult) {
        throw createError({
            statusCode: 404,
            statusMessage: `App ${name} not found`
        })
    }
    const stateLines = (stateResult as string).split('\n').slice(1, -1)
    const state: Record<string, string | boolean> = {}
    stateLines.forEach(line => {
        const [key, ...valueParts] = line.split(':')
        let value: string | boolean = valueParts.join(':').trim()
        if (value === 'true') value = true
        else if (value === 'false') value = false
        state[key.trim()] = value
    })
    return state
})
