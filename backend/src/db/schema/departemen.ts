import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const departemen = pgTable('departemen', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    logo: text('logo'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const departemenRelations = relations(departemen, ({ many }) => ({
    users: many(departemen),
    kepengurusan: many(departemen),
    kegiatan: many(departemen),
    arsip: many(departemen),
}));

export type Departemen = typeof departemen.$inferSelect;
export type NewDepartemen = typeof departemen.$inferInsert;
