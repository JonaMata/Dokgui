import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../database/schema'
export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
    return drizzle('./.data/db.sqlite', { schema })
}

const drizzleClient = useDrizzle()
drizzleClient.query.users.findMany().then(async (res: typeof schema.users.$inferSelect[]) => {
    if (res?.length === 0) {
        drizzleClient.insert(schema.users).values({ email: 'admin@example.com', password: await hashPassword('changeme'), createdAt: new Date() }).onConflictDoNothing().run();
    }
})

export const users = schema.users
export const tokens = schema.tokens

export type User = typeof schema.users.$inferSelect

export type Token = typeof schema.tokens.$inferSelect