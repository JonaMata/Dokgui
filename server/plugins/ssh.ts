import type {ConnectConfig} from 'ssh2';
import {Client} from 'ssh2'
import {readFileSync} from 'fs'

export default defineNitroPlugin((nitroApp) => {
    nitroApp.ssh = {
        client: undefined,
        ready: false,
        isReady: () => new Promise(resolve => {
            const checkReady = () => {
                if (nitroApp.ssh.ready) {
                    resolve(true)
                } else {
                    setTimeout(checkReady, 100)
                }
            }
            checkReady()
        })
    }
    nitroApp.ssh.client = createSshClient(nitroApp)
})

function createSshClient(nitroApp) {
    const conn: Client = new Client();
    const connectConfig: ConnectConfig = {
        host: '192.168.1.16',
        port: 22,
        username: 'dokku',
        privateKey: readFileSync('./.ssh/id_ed25519')
    }
    conn.on('ready', () => {
        console.log('SSH Client :: ready');
        nitroApp.ssh.ready = true;
    }).on('close', () => {
        console.log('SSH Client :: close');
        nitroApp.ssh.ready = false;
        // conn.connect(connectConfig)
        // nitroApp.ssh = createSshClient(nitroApp)
        // conn.destroy()
    }).on('error', (err) => {
        console.log('SSH Client :: error', err);
        nitroApp.ssh.ready = false;
        // nitroApp.ssh = createSshClient(nitroApp)
        // conn.destroy()
        // conn.connect(connectConfig)
    }).connect(connectConfig).on('error', (err) => {
        console.log(err)
        nitroApp.ssh.ready = false;
        // nitroApp.ssh = createSshClient(nitroApp)
        // conn.destroy()
    })
    return conn
}