import type {ConnectConfig} from 'ssh2';
import type {NitroApp} from 'nitropack'
import ssh2 from 'ssh2'
import 'dotenv/config'
import {readFileSync, writeFileSync, existsSync} from "node:fs";

export interface Ssh {
    client: ssh2.Client | undefined,
    ready: boolean,
    isReady: () => Promise<void>
}

declare module 'nitropack' {
    interface NitroApp {
        ssh: Ssh
    }
}

const keyPath = './.data/id_ed25519'

export default defineNitroPlugin((nitroApp) => {
    if (!existsSync(keyPath)) {
        const keys = ssh2.utils.generateKeyPairSync('ed25519')
        writeFileSync(keyPath, keys.private)
        writeFileSync(keyPath + '.pub', keys.public)
    }
    nitroApp.ssh = {
        client: undefined,
        ready: false,
        isReady: () => new Promise(resolve => {
            const checkReady = () => {
                if (nitroApp.ssh.ready) {
                    resolve()
                } else {
                    setTimeout(checkReady, 100)
                }
            }
            checkReady()
        })
    }
    nitroApp.ssh.client = createSshClient(nitroApp)
})

function createSshClient(nitroApp: NitroApp) {
    const conn: ssh2.Client = new ssh2.Client();
    const connectConfig: ConnectConfig = {
        host: process.env.DOKKU_SSH_HOST,
        port: process.env.DOKKU_SSH_PORT ? parseInt(process.env.DOKKU_SSH_PORT) : 22,
        username: 'dokku',
        privateKey: readFileSync(keyPath),
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
        console.log('SSH Error',err)
        nitroApp.ssh.ready = false;
        // nitroApp.ssh = createSshClient(nitroApp)
        // conn.destroy()
    })
    return conn
}