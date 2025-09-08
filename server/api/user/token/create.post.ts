import { z } from 'zod'

const bodySchema = z.object({
    name: z.string(),
})

const drizzle = useDrizzle();

export default defineEventHandler(async (event) => {
    const {  secure } = await requireUserSession(event)
    const { name } = await readValidatedBody(event, bodySchema.parse)
    const token = crypto.randomUUID()

    return drizzle.insert(tokens).values({
        userId: (secure!.user as User).id,
        name,
        token,
        createdAt: new Date(),
    }).returning().get();

})
