import zod from 'zod'
import {dokku} from "~~/server/utils/dokku";

const bodySchema = zod.object({
    name: zod.string().min(1).max(100)
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { provider } = event.context.params as { provider: string }
    const { name } = await readValidatedBody(event, bodySchema.parse)
    const stream = await dokku.databases.create(provider, name)
    return sendStream(event, stream)
})