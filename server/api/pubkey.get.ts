import {readFileSync} from "node:fs";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)

    return readFileSync('./.data/id_ed25519.pub')

})
