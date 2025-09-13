import zod from 'zod'
import { dokku } from "~~/server/utils/dokku";
import { DB_PROVIDERS } from "#shared/dokku/databases";

const bodySchema = zod.object({
    provider: zod.enum(DB_PROVIDERS).optional(),
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const { provider } = await getValidatedQuery(event, bodySchema.parse)
    return await dokku.databases.list(provider ? [provider] : undefined)
})
