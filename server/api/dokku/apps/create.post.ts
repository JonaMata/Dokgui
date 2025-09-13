import zod from 'zod'
import {dokku} from "~~/server/utils/dokku";

const bodySchema = zod.object({
    name: zod.string().min(1).max(100)
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { name } = await readValidatedBody(event, bodySchema.parse)
    const stream = await dokku.apps.create(name)
    return sendStream(event, stream)
})