const drizzle = useDrizzle();

export default defineEventHandler(async (event) => {
    const {  secure } = await requireUserSession(event)

    return drizzle.query.tokens.findMany({
        where: eq(tokens.userId, (secure!.user as User).id),
    })

})
