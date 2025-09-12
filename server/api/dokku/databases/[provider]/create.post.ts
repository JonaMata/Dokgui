import zod from 'zod'

const bodySchema = zod.object({
    name: zod.string().min(1).max(100)
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { provider } = event.context.params as { provider: string }
    if (!['mysql', 'postgres', 'mongo', 'redis', 'mariadb'].includes(provider)) {
        throw createError({ statusCode: 400, statusMessage: 'Unsupported provider' })
    }
    const { name } = await readValidatedBody(event, bodySchema.parse)
    const run = dokkuClient()
    const { stream } = run(`dokku ${provider}:create ${name}`)
    return sendStream(event, stream)
})