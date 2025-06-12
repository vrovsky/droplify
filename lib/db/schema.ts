import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const filesTable = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // basic file/folder info
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  // storage information
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  ///pwnership info
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"),

  // file/folder flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  // timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filesRelations = relations(filesTable, ({ one, many }) => ({
  parent: one(filesTable, {
    fields: [filesTable.parentId],
    references: [filesTable.id],
  }),

  children: many(filesTable),
}));

export const File = typeof filesTable.$inferSelect;
export const NewFile = typeof filesTable.$inferInsert;
