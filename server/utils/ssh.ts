import type {Client} from 'ssh2'


export async function sshGit(gitCommand: string, repo: string, writer: WritableStreamDefaultWriter, expectedMessages: number, commands?: Buffer | undefined) {
    let commandsSend = false
    let receivedMessages = 0
    let buffer: Buffer | undefined = undefined
    if (!commands) commandsSend = true
    const ssh: {client: Client, ready: boolean, isReady: () => Promise<void>} = useNitroApp().ssh
    await ssh.isReady()
    ssh.client.exec(gitCommand + ' ' + repo, (err, stream) => {
        if (err) {
            writer.abort(err);
            return stream.close()
        }
        stream.on('close', (code: number, signal: string) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            if (receivedMessages != expectedMessages) {
                writer.abort(new Error('Connection closed prematurely'));
            }
            return
        }).on('data', async (data: Buffer) => {
            if (!buffer) {
                buffer = data
            } else {
                buffer = Buffer.concat([buffer, data]);
            }
            if (commandsSend) {
                console.log(`Writing: ${data.toString()}`);
                writer.write(data).catch((err) => {
                    console.log('Writer error: ' + err);
                    console.log('Errored data: ' + data.toString('utf-8'));
                })
            }
            if (buffer.toString().endsWith('0000')) {
                if (commandsSend) {
                    receivedMessages += 1
                    if (receivedMessages == expectedMessages) {
                        writer.close()
                        return stream.close();
                    }
                } else {
                    commandsSend = true
                    stream.write(commands)
                    buffer = undefined
                }
            }
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
            writer.abort(new Error('STDERR: ' + data));
            return stream.close();
        });
    });
}

// export async function sshGit(gitCommand: string, repo: string, writer: WritableStreamDefaultWriter, expectedMessages: number, commands?: Buffer | undefined) {
//     let commandsSend = false
//     let receivedMessages = 0
//     let buffer: Buffer | undefined = undefined
//     if (!commands) commandsSend = true
//     const conn: Client = new Client();
//     conn.on('ready', () => {
//         console.log('Client :: ready');
//         conn.exec(gitCommand + ' ' + repo, (err, stream) => {
//             if (err) {
//                 writer.abort(err);
//                 return conn.end()
//             }
//             stream.on('close', (code: number, signal: string) => {
//                 console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
//                 if (receivedMessages != expectedMessages) {
//                     writer.abort(new Error('Connection closed prematurely'));
//                 }
//                 return conn.end();
//             }).on('data', async (data: Buffer) => {
//                 if (!buffer) {
//                     buffer = data
//                 } else {
//                     buffer = Buffer.concat([buffer, data]);
//                 }
//                 if (commandsSend) {
//                     console.log(`Writing: ${data.toString()}`);
//                     writer.write(data).catch((err) => {
//                         console.log('Writer error: ' + err);
//                         console.log('Errored data: ' + data.toString('utf-8'));
//                     })
//                 }
//                 if (buffer.toString().endsWith('0000')) {
//                     if (commandsSend) {
//                         receivedMessages += 1
//                         if (receivedMessages == expectedMessages) {
//                             writer.close()
//                             stream.close();
//                             return conn.end();
//                         }
//                     } else {
//                         commandsSend = true
//                         stream.write(commands)
//                         buffer = undefined
//                     }
//                 }
//             }).stderr.on('data', (data) => {
//                 console.log('STDERR: ' + data);
//                 writer.abort(new Error('STDERR: ' + data));
//                 stream.close();
//                 return conn.end();
//             });
//         });
//     }).connect({
//         host: '192.168.1.16',
//         port: 22,
//         username: 'dokku',
//         privateKey: readFileSync('./.ssh/id_ed25519')
//     }).on('error', (err) => {
//         writer.abort(err);
//         return conn.end()
//     })
// }