export const DB_PROVIDERS = ['mysql', 'postgres', 'mongo', 'redis', 'mariadb']

export type Provider = typeof DB_PROVIDERS[number]

export interface Database {
    name: string,
    provider: Provider,
    apps: string[],
    status: string,
    version: string,
}