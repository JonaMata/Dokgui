import {z} from 'zod'

const bodySchema = z.object({
    key: z.string().min(1),
})
export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {name} = event.context.params as { name: string }
    const {key} = await readValidatedBody(event, bodySchema.parse)
    return dokku.apps.config.unset(name, key).catch(err => {
        throw createError({
            statusCode: 404,
            statusMessage: `App ${name} not found`,
            data: err.message
        })
    })
})
