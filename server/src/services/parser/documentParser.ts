import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || fileType === 'pdf' || fileType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return cleanExtractedText(parsed.text);
  }

  if (ext === '.docx' || ext === '.doc' || fileType === 'docx' || fileType.includes('word')) {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return cleanExtractedText(result.value);
  }

  throw new Error(`Unsupported file type: ${ext || fileType}`);
}

export function cleanExtractedText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
