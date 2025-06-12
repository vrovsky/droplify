import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get("userId");
    const parentId = searchParams.get("parentId");

    if (!queryUserId || queryUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //fetch files fro, db
    let userFiles;
    if (parentId) {
      userFiles = await db
        .select()
        .from(filesTable)
        .where(
          and(eq(filesTable.userId, userId), eq(filesTable.parentId, parentId))
        );
    } else {
      userFiles = await db
        .select()
        .from(filesTable)
        .where(and(eq(filesTable.userId, userId), isNull(filesTable.parentId)));
    }
    return NextResponse.json(userFiles);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetching filse" },
      { status: 500 }
    );
  }
}
