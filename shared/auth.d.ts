import type { User as DBUser } from "~~/server/utils/drizzle"
declare module '#auth-utils' {
    interface User {
        email: string
    }

    // interface UserSession {
    //     // Add your own fields
    // }

    interface SecureSessionData {
        user: DBUser
    }
}

export {}