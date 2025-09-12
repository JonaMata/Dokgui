export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { name } = event.context.params as { name: string }
    const run = dokkuClient()
    const logsResult = await run(`logs ${name}`).result.catch(console.error)
    // if (!logsResult) {
    //     const apps = await listApps()
    //     if (!apps.find(app => app.name === name)) {
    //         throw createError({
    //             statusCode: 404,
    //             statusMessage: `App ${name} not found`
    //         })
    //     }
    //     return { logs: '' }
    // }
    return logsResult as string
})
