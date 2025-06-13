import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File id is required" },
        { status: 401 }
      );
    }
    const [file] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.id, fileId), eq(filesTable.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 401 });
    }

    const updatedFiles = await db
      .update(filesTable)
      .set({ isStarred: !file.isStarred })
      .where(and(eq(filesTable.id, fileId), eq(filesTable.userId, userId)))
      .returning();
    console.log("updatedFiles: ", updatedFiles);
    const updatedFile = updatedFiles[0];

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Fail to update the file" },
      { status: 401 }
    );
  }
}
