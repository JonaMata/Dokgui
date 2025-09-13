import {type App, APP_COMMANDS, type AppCommand, type AppInfo, type AppState} from "#shared/dokku/apps";
import {dokkuClient} from "~~/server/utils/dokku";
import {linesToRecord} from "~~/server/utils/parser";

const run = dokkuClient()

const config = {
    list: async (name: string) => {
        const configResult = await run(`config:show ${name}`).result as string
        const configLines = configResult.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        return configLines.map((line) => {
            const splits = line.split(':')
            return {key: splits[0].trim(), value: splits.slice(1).join(':').trim()}
        })
    },
    get: async (name: string, key: string) => {
        const configResult = await run(`config:get ${name} ${key}`).result as string
        const configLines = configResult.split('\n').map(line => line.trim())
        return linesToRecord(configLines)[0]
    },
    set: async (name:string, key: string, value: string) => {
        return await run(`config:set ${name} ${key}="${value.replaceAll(' ', '\\ ')}"`).result
    },
    setAll: async (name: string, configs:{key: string, value: string}[]) => {
        return await run(`config:set ${name} ${configs.map(c => `${c.key}="${c.value.replaceAll(' ', '\\ ')}"`).join(' ')}`).result
    },
    unset: async (name: string, key: string) => {
        return await run(`config:unset ${name} ${key}`).result
    },
    unsetAll: async (name: string, configs:{key: string, value: string}[]) => {
        return await run(`config:unset ${name} ${configs.map(c => c.key).join(' ')}`).result
    }
}

const command = async (name: string, cmd: AppCommand) => {
    if (!APP_COMMANDS.includes(cmd)) {
        throw new Error('Invalid command')
    }
    const { stream } = run(`ps:${cmd} ${name}`, {includeStderr: true, quiet: false})
    return stream
}

const create = async (name: string) => {
    const { stream } = run(`apps:create ${name}`, {includeStderr: true, quiet: false})
    return stream
}

const destroy = async (name: string) => {
    return await run(`apps:destroy ${name} --force`).result
}

const logs = async (name: string) => {
    return await run(`logs ${name}`, {includeStderr: true}).result
}

const info = async (name: string): Promise<AppInfo> => {
    const infoResult = await run(`apps:report ${name}`).result.catch(console.error) as string
    const infoLines = infoResult.split('\n').map(line => line.trim())
    const infoRecords: Record<string, string> = linesToRecord(infoLines)
    return {
        createdAt: new Date(parseInt(infoRecords['App created at']) * 1000),
        deploySource: infoRecords['App deploy source'],
        locked: infoRecords['App locked'] === 'true',
    }
}

const state = async (name: string): Promise<AppState> => {
    const psResult = await run(`ps:report ${name}`).result.catch(console.error) as string
    const psLines = psResult.split('\n').map(line => line.trim())
    const psRecords = linesToRecord(psLines)
    return {
        running: psRecords['Running'] === 'true',
        deployed: psRecords['Deployed'] === 'true',
    }
}

const urls = async (name: string): Promise<string[]> => {
    const urlsResult = await run(`urls ${name}`).result.catch(console.error) as string
    return urlsResult.split('\n').map(url => url.trim()).filter(url => url.length > 0)
}

interface ListOptions {
    withInfo?: boolean,
    withState?: boolean,
    withUrls?: boolean
}

const list = async (options: ListOptions = {}): Promise<App[]> => {
    options = {
        withInfo: false,
        withState: false,
        withUrls: false,
        ...options
    }
    const apps: App[] = []
    if (options.withState) {
        const psResult = await run('ps:report', {quiet: false}).result.catch(console.error)
        const psApps = (psResult as string).split('=====>').slice(1)
        psApps.forEach((app) => {
            const appLines = app.split('\n').map(line => line.trim()).filter(line => line.length > 0)
            const name = appLines[0].split(' ')[0].trim()
            const state: Record<string, string> = linesToRecord(appLines.slice(1))

            apps.push({
                name,
                state: {
                    running: state['Running'] === 'true',
                    deployed: state['Deployed'] === 'true',
                }
            })
        })
    } else {
        const appsResult = await run('apps:list').result.catch(console.error)
        const appNames = (appsResult as string).split('\n').slice(0, -1).map(app => app.trim())
        for (const app of appNames) {
            apps.push({name: app})
        }
    }

    const extraPromises = []
    if (options.withInfo) {
        extraPromises.push((async () => {
            const appsInfoPromises = apps.map(app => info(app.name).catch(console.error))
            for (const [index, promise] of appsInfoPromises.entries()) {
                const appInfo = await promise
                if (appInfo) {
                    apps[index].info = appInfo
                }
            }
        })())
    }
    if (options.withUrls) {
        extraPromises.push((async () => {
            const appsUrlsPromises = apps.map(app => urls(app.name).catch(console.error))
            for (const [index, promise] of appsUrlsPromises.entries()) {
                const appUrls = await promise
                if (appUrls) {
                    apps[index].urls = appUrls
                }
            }
        })())
    }
    await Promise.all(extraPromises)
    return apps
}

export default {
    command,
    create,
    destroy,
    logs,
    info,
    state,
    urls,
    list,
    config,
}