import { listApps } from '~~/server/utils/dokku'
export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const apps = await listApps()
    // console.log(`Found apps: ${apps}`)
    return apps
})
