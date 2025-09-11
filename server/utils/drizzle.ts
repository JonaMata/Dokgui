import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../database/schema'
export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
    return drizzle('./.data/db.sqlite', { schema })
}

const drizzle = useDrizzle()

if ((await drizzle.query.users.findMany()).length === 0) {
    // create a default user
    await drizzle.insert(schema.users).values({ email: 'admin@example.com', password: await hashPassword('changeme'), createdAt: new Date() }).onConflictDoNothing().run();
}

export const users = schema.users
export const tokens = schema.tokens

export type User = typeof schema.users.$inferSelect

export type Token = typeof schema.tokens.$inferSelect