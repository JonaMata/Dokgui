import { z } from 'zod'

const bodySchema = z.object({
    name: z.string(),
})

const drizzle = useDrizzle();

export default defineEventHandler(async (event) => {
    const {  secure } = await requireUserSession(event)
    const { name } = await readValidatedBody(event, bodySchema.parse)

    return drizzle.delete(tokens).where(
        and(
            eq(tokens.userId, (secure!.user as User).id),
            eq(tokens.name, name)
        )).run();

})
