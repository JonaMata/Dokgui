import { sshGit} from "~~/server/utils/ssh";

export default defineEventHandler(async (event) => {
    setHeader(event, 'cache-control', 'no-cache')
    if (!event.context.auth?.user) {
        setHeader(event, 'WWW-Authenticate', 'Basic realm="Git Repository"')
        throw createError({statusCode: 401, statusMessage: 'Unauthorized'})
    }

    setHeader(event, 'content-type', 'application/x-git-upload-pack-result')

    const repo = getRouterParam(event, 'repo')
    let commands = await readRawBody(event, false)
    // console.log('commands: ', commands?.toString())
    // if (commands?.toString().startsWith('0014command=ls-refs')) {
    //     commands = undefined
    // }
    const stream = new TransformStream()


    sshGit('git-upload-pack', repo!, stream.writable.getWriter(), 1, commands)
    return sendStream(event, stream.readable)
});