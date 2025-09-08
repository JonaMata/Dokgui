import { sshGit} from "~~/server/utils/ssh";

export default defineEventHandler(async (event) => {
    setHeader(event, 'cache-control', 'no-cache')
    if (!event.context.auth?.user) {
        setHeader(event, 'WWW-Authenticate', 'Basic realm="Git Repository"')
        throw createError({statusCode: 401, statusMessage: 'Unauthorized'})
    }

    setHeader(event, 'content-type', 'application/x-git-receive-pack-result')

    const repo = getRouterParam(event, 'repo')

    const commands = await readRawBody(event, false)
    // console.log('commands: ', commands)
    // if (commands.startsWith('0014command=ls-refs')) {
    //     commands = null
    // }
    const stream = new TransformStream()

    sshGit('git-receive-pack', repo!, stream.writable.getWriter(), 2, commands)
    return sendStream(event, stream.readable)
});