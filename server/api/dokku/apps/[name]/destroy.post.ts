import { dokku } from "~~/server/utils/dokku";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { name} = event.context.params as { name: string }
    return await dokku.apps.destroy(name).catch(err => {
        throw createError({statusCode: 500, statusMessage: err.message})
    })
})
