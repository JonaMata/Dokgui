export const APP_COMMANDS = ['rebuild', 'start', 'stop', 'restart']

export type AppCommand = typeof APP_COMMANDS[number]

export interface AppInfo {
    createdAt: Date,
    deploySource: string,
    locked: boolean,
}

export interface AppState {
    running: boolean,
    deployed: boolean,
}

export interface App {
    name: string,
    info?: AppInfo,
    state?: AppState,
    urls?: string[]
}