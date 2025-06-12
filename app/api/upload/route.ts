import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

import { addToDB } from "@/lib/vector.ts";

export async function POST(req: Request) {
  try {
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file content
    const fileContent = await file.text();

    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Transform records into LLM-friendly format
    const formattedData = records.map(async (record: any, index: number) => {
      const entries = Object.entries(record);
      let dataString = `Product ${index + 1}:\n${entries
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`;

      // Add data to Pinecone
      await addToDB(dataString, userId);
      return dataString;
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error processing CSV:", error);
    return NextResponse.json(
      { error: "Error processing CSV file" },
      { status: 500 }
    );
  }
}
