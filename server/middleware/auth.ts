const drizzle = useDrizzle()

export default defineEventHandler(async (event) => {
    const {secure} = await getUserSession(event)
    if (secure?.user) {
        event.context.auth = {user: secure.user}
        return
    }
    const header = event.headers.get('authorization')
    if (header?.startsWith('Basic ')) {
        const authString = Buffer.from(header.substring(6), 'base64').toString()
        const [, tokenString] = authString.split(':')
        const token = await drizzle.query.tokens.findFirst({
            where: eq(tokens.token, tokenString),
            with: {
                user: true
            }
        })
        if (token?.user) {
            event.context.auth = {user: token.user}
        }
    }
})
