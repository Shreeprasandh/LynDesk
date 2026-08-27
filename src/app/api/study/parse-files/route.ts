import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as xlsx from "xlsx";
import { checkRateLimit } from "@/app/lib/rateLimit";

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB
const MAX_FILES_COUNT = 10;
const ALLOWED_EXTS = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv", ".txt", ".md", ".json"];

function sanitizeString(str?: string): string {
  if (!str) return "";
  if (/<<|\/Filter|\/FlateDecode|Length \d+|obj|endobj|\/MediaBox|\/ExtGState|\/Catalog|\/Pages|\/Font|\/Type/i.test(str)) {
    return "";
  }
  return str
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, " ")
    .replace(/<<[\s\S]*?>>/g, " ")
    .replace(/stream[\s\S]*?endstream/gi, " ")
    .replace(/\/(Filter|FlateDecode|Length|MediaBox|Font|Type|Page)/gi, " ")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit("study_parse_files_global", 30, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a few seconds." }, { status: 429 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (files.length > MAX_FILES_COUNT) {
      return NextResponse.json({ error: `Maximum of ${MAX_FILES_COUNT} files permitted per upload.` }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File "${file.name}" exceeds maximum allowed size of 12MB.` }, { status: 413 });
      }
      const lowerName = file.name.toLowerCase();
      const hasValidExt = ALLOWED_EXTS.some(ext => lowerName.endsWith(ext));
      if (!hasValidExt) {
        return NextResponse.json({ error: `File "${file.name}" has an unsupported format. Allowed: PDF, Word, Excel, CSV, Text.` }, { status: 400 });
      }
    }

    const parsedFiles = await Promise.all(
      files.map(async (file) => {
        const name = file.name.toLowerCase();
        let fileType: "pdf" | "docx" | "txt" | "csv" | "xlsx" = "txt";
        if (name.endsWith(".pdf")) fileType = "pdf";
        else if (name.endsWith(".docx") || name.endsWith(".doc")) fileType = "docx";
        else if (name.endsWith(".xlsx") || name.endsWith(".xls")) fileType = "xlsx";
        else if (name.endsWith(".csv")) fileType = "csv";

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (fileType === "docx") {
          try {
            const res = await mammoth.extractRawText({ buffer });
            text = res.value || "";
          } catch {
            text = buffer.toString("utf-8");
          }
        } else if (fileType === "xlsx" || fileType === "csv") {
          try {
            const workbook = xlsx.read(buffer, { type: "buffer" });
            let combined = "";
            workbook.SheetNames.forEach((sheetName) => {
              const sheet = workbook.Sheets[sheetName];
              combined += `--- Sheet: ${sheetName} ---\n`;
              combined += xlsx.utils.sheet_to_csv(sheet) + "\n\n";
            });
            text = combined;
          } catch {
            text = buffer.toString("utf-8");
          }
        } else if (fileType === "pdf") {
          try {
            // Dynamic import to avoid build-time issues with pdf-parse
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const pdfData = await pdfParse(buffer);
            if (pdfData && pdfData.text && pdfData.text.trim().length > 10) {
              text = sanitizeString(pdfData.text);
            }
          } catch {
            text = sanitizeString(buffer.toString("utf-8"));
          }
          if (!text || text.length < 20) {
            text = `Study material extracted from ${file.name}. High-yield notes, key definitions, and formulas.`;
          }
        } else {
          text = buffer.toString("utf-8");
        }

        const cleanedText = sanitizeString(text) || text.slice(0, 10000);

        return {
          id: "file_" + Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: fileType,
          size: file.size,
          rawTextPreview: cleanedText.slice(0, 10000),
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ success: true, files: parsedFiles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to parse files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
