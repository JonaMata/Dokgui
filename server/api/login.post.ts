import { z } from 'zod'

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

const drizzle = useDrizzle();

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse)

    const user: User | undefined  = await drizzle.query.users.findFirst({
        where: eq(users.email, email)
    })
    if (user && await verifyPassword(user.password, password)) {
        // set the user session in the cookie
        // this server util is auto-imported by the auth-utils module
        await setUserSession(event, {
            user: {
                email: user.email,
            },
            secure: {
                user,
            },
        })
        return {}
    }
    throw createError({
        statusCode: 401,
        message: 'Bad credentials'
    })
})
