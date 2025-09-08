import {Client} from 'ssh2'
import {readFileSync} from 'fs'

export async function listApps() {
    const apps: {
        name: string,
        urls?: string[],
        running?: boolean,
        deployed?: boolean,
    }[] = []
    const client = await dokkuClient() as { run: (command: string) => Promise<string>, close: () => void }
    const appsResult = await client.run('apps:list').catch(console.error)
    const appNames = (appsResult as string).split('\n').slice(0, -1).map(app => app.trim())
    for (const app of appNames) {
        apps.push({name: app})
    }
    for (const app of apps) {
        const appUrlsResult = await client.run(`urls ${app.name}`)
        app.urls = (appUrlsResult as string).split('\n').slice(0, -1).map(app => app.trim())
    }
    const psResult = await client.run('ps:report')
    const psLines = (psResult as string).split('Stop timeout seconds:').slice(0, -1)
    console.log(psResult)
    psLines.forEach((line, index) => {
        console.log(line)
        const running = line.split('Running: ')[1].split('\n')[0].trim()
        const deployed = line.split('Deployed: ')[1].split('\n')[0].trim()
        apps[index].running = running === 'true'
        apps[index].deployed = deployed === 'true'
    })
    client.close()
    return apps
}

async function dokkuClient() {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log('Client :: ready');
            resolve({
                run: (command: string) => {
                    return new Promise((resolve, reject) => {
                        let result = ""
                        conn.exec('--quiet ' + command, (err, stream) => {
                            if (err) reject(err)
                            stream.on('close', (code: number, signal: string) => {
                                if (code === 0) {
                                    resolve(result)
                                } else {
                                    reject(`code: ${code}, signal: ${signal}, result: ${result}`)
                                }
                            }).on('data', (data: Buffer) => {
                                result += data.toString()
                            }).stderr.on('data', (err) => {
                                reject(err)
                            })
                        })
                    })
                },
                close: () => conn.end()
            })
        }).connect({
            host: '192.168.1.16',
            port: 22,
            username: 'dokku',
            privateKey: readFileSync('./.ssh/id_ed25519')
        }).on('error', (err) => {
            reject(err)
        });
    })
}