import {z} from 'zod'
import {APP_COMMANDS} from "#shared/dokku/apps";

const bodySchema = z.object({
    command: z.enum(APP_COMMANDS)
})
export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const {name} = event.context.params as { name: string }
    const {command} = await readValidatedBody(event, bodySchema.parse)
    const stream = await dokku.apps.command(name, command)
    return sendStream(event, stream)
})
