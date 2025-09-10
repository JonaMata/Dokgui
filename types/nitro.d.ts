import type {Client} from "ssh2";

declare module 'nitropack' {
    interface NitroApp {
        ssh: Ssh
    }
}

interface Ssh {
    client: Client,
    ready: boolean,
    isReady: () => Promise<void>
}