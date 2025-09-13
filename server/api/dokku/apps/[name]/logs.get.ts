export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { name } = event.context.params as { name: string }
    return dokku.apps.logs(name)
})
