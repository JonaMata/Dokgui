import type {Database, Provider} from "#shared/dokku/databases";
import { DB_PROVIDERS } from "#shared/dokku/databases";
import {linesToRecord} from "~~/server/utils/parser";

const run = dokkuClient()

export const providers = async (): Promise<string[]> => {
    const storage = useStorage('databases')
    const storageItem = await storage.getItem<string[]>('providers')
    if (storageItem && Array.isArray(storageItem)) {
        return storageItem
    }

    const availablePlugins = await run('plugin:list').result.catch(err => console.error(err.toString())) as string
    const providers = DB_PROVIDERS.filter(provider => availablePlugins.includes(provider))
    storage.setItem('providers', providers)
    return providers
}

export const command = async (provider: string, name: string, cmd: string) => {
    if (!['start', 'stop', 'restart'].includes(cmd)) {
        throw new Error('Invalid command')
    }
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    const { stream } = run(`${provider}:${cmd} ${name}`, {includeStderr: true, quiet: false})
    return stream
}

export const create = async (provider: string, name: string) => {
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    const { stream } = run(`${provider}:create ${name}`, {includeStderr: true, quiet: false})
    return stream
}

export const destroy = async (provider: string, name: string) => {
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    return await run(`${provider}:destroy ${name} -f`).result
}

export const link = async (provider: string, name: string, app: string) => {
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    const { stream } = run(`${provider}:link ${name} ${app}`, {includeStderr: true, quiet: false})
    return stream
}

export const unlink = async (provider: string, name: string, app: string) => {
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    const { stream } = run(`${provider}:unlink ${name} ${app}`, {includeStderr: true, quiet: false})
    return stream
}

export const logs = async (provider: string, name: string) => {
    if (!(await providers()).includes(provider)) {
        throw new Error('Invalid provider')
    }
    return await run(`${provider}:logs ${name}`, {includeStderr: true}).result
}

export const info = async (provider: Provider, name: string): Promise<Database> => {
    if (!DB_PROVIDERS.includes(provider)) {
        throw new Error('Invalid provider')
    }
    const availablePlugins = await providers()
    if (!availablePlugins.includes(provider)) {
        throw new Error('Provider not available')
    }
    const infoResult = await run(`${provider}:info ${name}`).result.catch(err => console.error(err.toString())) as string
    const infoLines = infoResult.split('\n').map(line => line.trim()) || []
    const info = linesToRecord(infoLines)
    let apps: string[] = []
    if (info.Links !== '-') {
        apps = (info.Links as string).split(' ').map(link => link.trim())
    }
    return {name, provider, apps, status: info.Status, version: info.Version}

}
export const list = async (queryProviders?: Provider[]): Promise<Record<string, Database[]>> => {
    if (queryProviders && !queryProviders.every(provider => DB_PROVIDERS.includes(provider))) {
        throw new Error('Invalid providers')
    }
    let usedProviders
    if (queryProviders && queryProviders.length > 0) {
        usedProviders = queryProviders
    } else {
        usedProviders = DB_PROVIDERS
    }

    const availablePlugins = await providers()
    const dbResults: Record<string, Promise<unknown>> = {}
    for (const provider of usedProviders) {
        if (availablePlugins.includes(provider)) {
            dbResults[provider] = run(`${provider}:list`).result.catch(err => console.error(err.toString()))
        }
    }
    const databases: Record<string, Database[]> = {}
    for (const [provider, result] of Object.entries(dbResults)) {
        const res = await result as string
        const names = res?.split('\n').slice(0, -1).map(db => db.trim()) || []
        databases[provider] = []
        for (const name of names) {
            databases[provider].push(await info(provider, name))
        }
    }
    return databases
}

export default {
    providers,
    command,
    create,
    destroy,
    link,
    unlink,
    logs,
    info,
    list,
}