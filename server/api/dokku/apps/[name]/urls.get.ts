import {dokkuClient} from "~~/server/utils/dokku";

export default defineEventHandler(async (event) => {
    const run = dokkuClient()
    const {name} = event.context.params as { name: string }
    const urlsResult = await run(`urls ${name}`).result.catch(console.error)
    if (!urlsResult) {
        throw createError({
            statusCode: 404,
            statusMessage: `App ${name} not found`
        })
    }
    const urlsLines = (urlsResult as string).split('\n').slice(0, -1)
    return urlsLines
})
