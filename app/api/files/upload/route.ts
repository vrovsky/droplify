import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(requet: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await requet.formData();
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as String;
    const parentId = (formData.get("parentId") as String).toString() || null;

    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 401 });
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
    }

    if (!parentId) {
      return NextResponse.json(
        { error: "Parent folder not found" },
        { status: 401 }
      );
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only images and pdf are supported" },
        { status: 401 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const folderPath = parentId
      ? `/droplify/${userId}/folder/${parentId}`
      : `/droplify/${userId}`;

    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExtension}}`;
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: true,
    });

    const fileDate = {
      name: originalFilename,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };
    const [newFile] = await db.insert(filesTable).values(fileDate).returning();
    return NextResponse.json(newFile);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 401 }
    );
  }
}
