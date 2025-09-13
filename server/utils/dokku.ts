import databases from './dokku/databases'
import apps from './dokku/apps'

export const dokku = {
    databases,
    apps,
}

interface DokkuOptions {
    includeStderr?: boolean,
    quiet?: boolean,
}

export function dokkuClient() {
    return (command: string, options: DokkuOptions = {}) => {
        options = {
            includeStderr: false,
            quiet: true,
            ...options
        }
        if (options.quiet) {
            command = '--quiet ' + command
        }
        const stream = new TransformStream()
        const writer = stream.writable.getWriter()
        const result = new Promise((resolve, reject) => {
            let result = ""
            const ssh = useNitroApp().ssh
            ssh.isReady().then(() => {
                ssh.client!.exec(command, (err, stream) => {
                    if (err) {
                        writer.abort(err)
                        reject(err)
                    }
                    stream.on('close', (code: number, signal: string) => {
                        if (code === 0) {
                            writer.close()
                            resolve(result)
                        } else {
                            writer.abort(`code: ${code}, signal: ${signal}, result: ${result}`)
                            reject(`code: ${code}, signal: ${signal}, result: ${result}`)
                        }
                    }).on('data', (data: Buffer) => {
                        result += data.toString()
                        writer.write(data)
                    }).on('error', (err: Buffer) => {
                        stream.destroy()
                        writer.abort(err.toString())
                        reject(err.toString())
                    }).stderr.on('data', (err) => {
                        if (options.includeStderr) {
                            result += err.toString()
                            writer.write(err)
                        } else {
                            stream.destroy()
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