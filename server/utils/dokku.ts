import type {Client} from 'ssh2'

export async function listApps() {
    const apps: {
        name: string,
        urls?: string[],
        running?: boolean,
        deployed?: boolean,
    }[] = []
    const run = dokkuClient()
    const psQuery = run('ps:report').result
    const appsResult = await run('apps:list').result.catch(console.error)
    const appNames = (appsResult as string).split('\n').slice(0, -1).map(app => app.trim())
    for (const app of appNames) {
        apps.push({name: app})
    }
    const appsUrlsPromises = apps.map(app => run(`urls ${app.name}`).result.catch(console.error))
    const psResult = await psQuery
    const psLines = (psResult as string).split('Stop timeout seconds:').slice(0, -1)
    psLines.forEach((line, index) => {
        const running = line.split('Running: ')[1].split('\n')[0].trim()
        const deployed = line.split('Deployed: ')[1].split('\n')[0].trim()
        apps[index].running = running === 'true'
        apps[index].deployed = deployed === 'true'
    })
    for (const [index, promise] of appsUrlsPromises.entries()) {
        const appUrlsResult = await promise
        apps[index].urls = (appUrlsResult as string).split('\n').slice(0, -1).map(app => app.trim())
    }
    return apps
}

export function dokkuClient(includeStderr = false) {
    return (command: string) => {
        const stream = new TransformStream()
        const writer = stream.writable.getWriter()
        const result = new Promise((resolve, reject) => {
            let result = ""
            const ssh = useNitroApp().ssh
            ssh.isReady().then(() => {
                ssh.client!.exec('--quiet ' + command, (err, stream) => {
                    if (err) {
                        console.error(err)
                        writer.abort(err)
                        reject(err)
                    }
                    stream.on('close', (code: number, signal: string) => {
                        if (code === 0) {
                            writer.close()
                            resolve(result)
                        } else {
                            console.error(`code: ${code}, signal: ${signal}, result: ${result}`)
                            writer.abort(`code: ${code}, signal: ${signal}, result: ${result}`)
                            reject(`code: ${code}, signal: ${signal}, result: ${result}`)
                        }
                    }).on('data', (data: Buffer) => {
                        result += data.toString()
                        writer.write(data)
                        // console.log(data.toString())
                    }).on('error', (err) => {
                        console.error(err)
                        writer.abort(err)
                        reject(err)
                    }).stderr.on('data', (err) => {
                        if (includeStderr) {
                            result += err.toString()
                            writer.write(err)
                        } else {
                            console.error(err.toString())
                            writer.abort(err)
                            reject(err)
                        }
                    })
                })
            })
        })
        return {
            stream: stream.readable,
            result
        }
    }
}