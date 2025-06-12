import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { isFloat32Array } from "util/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { name, userId: bodyUserId, parentId = null } = body;

    if (bodyUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(filesTable)
        .where(
          and(
            eq(filesTable.id, parentId),
            eq(filesTable.userId, userId),
            eq(filesTable.isFolder, true)
          )
        );
      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 400 }
        );
      }

      const folderData = {
        id: uuidv4(),
        name: name.trim(),
        path: `/folders/${userId}/${uuidv4()}`,
        size: 0,
        type: "folder",
        fileUrl: "",
        thumbnailUrl: null,
        userId,
        parentId,
        isFolder: true,
        isStarted: false,
        isTrash: false,
      };

      const [newFolder] = await db
        .insert(filesTable)
        .values(folderData)
        .returning();
      return NextResponse.json({
        succes: true,
        message: "Folder created successfully",
        folder: newFolder,
      });
    }
  } catch (error) {}
}
