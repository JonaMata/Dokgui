import zod from 'zod'

const querySchema = zod.object({
    withState: zod.stringbool().optional().default(false),
    withInfo: zod.stringbool().optional().default(false),
    withUrls: zod.stringbool().optional().default(false),
})

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const options = await getValidatedQuery(event, querySchema.parse)
    return await dokku.apps.list(options)
})
