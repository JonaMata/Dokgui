import zod from "zod";
import { dokku } from "~~/server/utils/dokku";

const bodySchema = zod.object({
    command: zod.enum(['start', 'stop', 'restart']),
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {provider, name} = event.context.params as { provider: string, name: string }
    const { command } = await readValidatedBody(event, bodySchema.parse)
    return await dokku.databases.command(provider, name, command)
})
