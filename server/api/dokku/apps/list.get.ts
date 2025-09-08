import { listApps } from '~~/server/utils/dokku'
export default defineEventHandler(async (event) => {
    console.log('Retrieving apps')
    const apps = await listApps()
    console.log(`Found apps: ${apps}`)
    return apps
})
