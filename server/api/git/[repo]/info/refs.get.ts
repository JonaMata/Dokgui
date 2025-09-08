import { sshGit} from "~~/server/utils/ssh";

export default defineEventHandler(async (event) => {
    setHeader(event, 'cache-control', 'no-cache')
    if (!event.context.auth?.user) {
        setHeader(event, 'WWW-Authenticate', 'Basic realm="Git Repository"')
        throw createError({statusCode: 401, statusMessage: 'Unauthorized'})
    }

    const repo = getRouterParam(event, 'repo')
    const query = getQuery(event)
    setHeader(event, 'content-type', 'application/x-'+query.service+'-advertisement')
    let prepend=""
    if (query.service == "git-upload-pack") {
        prepend = "001e# service=git-upload-pack\n" +
            "0000"
    }

    if (query.service == "git-receive-pack") {
        prepend = "001f# service=git-receive-pack\n" +
            "0000"
    }

    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    writer.write(prepend)
    sshGit(query.service as string, repo!, writer, 1)
    return sendStream(event, stream.readable)
});