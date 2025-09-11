import type {ConnectConfig} from 'ssh2';
import {Client} from 'ssh2'
import 'dotenv/config'

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
        host: process.env.DOKKU_SSH_HOST,
        port: process.env.DOKKU_SSH_PORT ? parseInt(process.env.DOKKU_SSH_PORT) : 22,
        username: 'dokku',
        privateKey: process.env.DOKKU_SSH_PRIVATE_KEY,
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