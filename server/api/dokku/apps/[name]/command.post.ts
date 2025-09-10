import {dokkuClient} from "~~/server/utils/dokku";
import {z} from 'zod'

const bodySchema = z.object({
    command: z.enum(['rebuild', 'start', 'stop', 'restart'])
})
export default defineEventHandler(async (event) => {
    const run = dokkuClient(true)
    const {name} = event.context.params as { name: string }
    const {command} = await readValidatedBody(event, bodySchema.parse)
    const {result, stream} = run(`ps:${command} ${name}`)
    result.catch(console.error)
    return sendStream(event, stream)
})
