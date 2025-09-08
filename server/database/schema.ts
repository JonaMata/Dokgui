import {sqliteTable, text, integer, unique} from 'drizzle-orm/sqlite-core'
import {relations} from "drizzle-orm";

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({autoIncrement: true}),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
})

export const tokens = sqliteTable('tokens', {
        id: integer('id').primaryKey({autoIncrement: true}),
        name: text('name').notNull(),
        userId: integer('user_id').notNull().references(() => users.id),
        token: text('token').notNull().unique(),
        createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
    },
    (t) => [
        unique().on(t.userId, t.name),
    ])

export const tokensRelations = relations(tokens, ({ one }) => ({
    user: one(users, {
        fields: [tokens.userId],
        references: [users.id],
    })
}))

export const usersRelations = relations(users, ({ many }) => ({
    tokens: many(tokens),
}))