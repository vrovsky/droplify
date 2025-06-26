import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all files in trash for this user
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (trashedFiles.length === 0) {
      return NextResponse.json(
        { message: "No files in trash" },
        { status: 200 }
      );
    }

    // Delete files from ImageKit
    const deletePromises = trashedFiles
      .filter((file) => !file.isFolder) // Skip folders
      .map(async (file) => {
        try {
          let imagekitFileId = null;

          if (file.fileUrl) {
            const urlWithoutQuery = file.fileUrl.split("?")[0];
            imagekitFileId = urlWithoutQuery.split("/").pop();
          }

          if (!imagekitFileId && file.path) {
            imagekitFileId = file.path.split("/").pop();
          }

          if (imagekitFileId) {
            try {
              const searchResults = await imagekit.listFiles({
                name: imagekitFileId,
                limit: 1,
              });

              if (searchResults && searchResults.length > 0) {
                await imagekit.deleteFile(searchResults[0].fileId);
              } else {
                await imagekit.deleteFile(imagekitFileId);
              }
            } catch (searchError) {
              console.error(
                `Error searching for file in ImageKit:`,
                searchError
              );
              await imagekit.deleteFile(imagekitFileId);
            }
          }
        } catch (error) {
          console.error(`Error deleting file ${file.id} from ImageKit:`, error);
        }
      });

    // Wait for all ImageKit deletions to complete (or fail)
    await Promise.allSettled(deletePromises);

    // Delete all trashed files from the database
    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} files from trash`,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
