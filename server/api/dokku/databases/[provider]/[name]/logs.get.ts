import { dokku } from "~~/server/utils/dokku";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {provider, name} = event.context.params as { provider: string, name: string }
    return await dokku.databases.logs(provider, name).catch(err => {
        return createError(err)
    })
})
