import { pgTable, text, uuid, integer, boolean } from "drizzle-orm/pg-core";
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
  parentId: uuid("parent_id").notNull(),
});
