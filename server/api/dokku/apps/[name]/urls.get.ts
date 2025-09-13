export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {name} = event.context.params as { name: string }
    return dokku.apps.urls(name).catch(err => {
        throw createError({
            statusCode: 404,
            statusMessage: `App ${name} not found`,
            data: err.message
        })
    })
})
