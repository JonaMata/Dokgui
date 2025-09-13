import zod from "zod";
import { dokku } from "~~/server/utils/dokku";

const bodySchema = zod.object({
    app: zod.string().trim(),
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {provider, name} = event.context.params as { provider: string, name: string }
    const { app } = await readValidatedBody(event, bodySchema.parse)
    return await dokku.databases.unlink(provider, name, app)
})
