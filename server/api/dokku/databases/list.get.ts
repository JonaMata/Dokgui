import zod from 'zod'

const providerList = ['mysql', 'postgres', 'mongo', 'redis', 'mariadb']

const bodySchema = zod.object({
    provider: zod.enum(providerList).optional(),
})

export default defineEventHandler(async (event) => {
    const run = dokkuClient()
    await requireUserSession(event)
    const { provider } = await getValidatedQuery(event, bodySchema.parse)
    let usedProviders
    if (provider) {
        usedProviders = [provider]
    } else {
        usedProviders = providerList
    }
    usedProviders = providerList
    const providers = await run('plugin:list').result.catch(err => console.error(err.toString())) as string
    const dbResults: Record<string, Promise<unknown>> = {}
    for (const provider of usedProviders) {
        if (providers.includes(provider)) {
            dbResults[provider] = run(`${provider}:list`).result.catch(err => console.error(err.toString()))
        }
    }
    const databases: Record<string, Record<string, string | string[]>[]> = {}
    for (const [provider, result] of Object.entries(dbResults)) {
        const res = await result as string
        const names = res?.split('\n').slice(0, -1).map(db => db.trim()) || []
        databases[provider] = []
        for (const name of names) {
            const infoResult = await run(`${provider}:info ${name}`).result.catch(err => console.error(err.toString())) as string
            //parse info into key value pairs
            const infoLines = infoResult?.split('\n').map(line => line.trim()) || []
            const info: Record<string, string | string[]> = {}
            for (const line of infoLines) {
                const [key, value] = line.split(':').map(part => part.trim())
                info[key] = value
            }
            if (info.Links === '-') {
                info.Links = []
            } else {
                info.Links = (info.Links as string).split(',').map(link => link.trim())
            }

            databases[provider].push({name, ...info})
        }
    }
    return databases
})
