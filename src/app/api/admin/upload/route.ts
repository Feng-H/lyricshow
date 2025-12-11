import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'bilingual-praise-songs-secret-key';
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Verify admin token
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// Validate JSON structure
async function validateJsonFile(fileBuffer: Buffer): Promise<{ valid: boolean; message?: string; songCount?: number }> {
  try {
    const content = fileBuffer.toString('utf-8');
    const data = JSON.parse(content);

    // Check if it's an array
    if (!Array.isArray(data)) {
      return { valid: false, message: 'File must contain an array of songs' };
    }

    // Check if array is empty
    if (data.length === 0) {
      return { valid: false, message: 'File cannot be empty' };
    }

    // Validate structure of first few items
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const item = data[i];
      if (!item.id || !item.title || !item.cn_lines || !item.en_lines) {
        return { valid: false, message: `Invalid song structure at index ${i}. Each song must have id, title, cn_lines, and en_lines` };
      }

      if (!Array.isArray(item.cn_lines) || !Array.isArray(item.en_lines)) {
        return { valid: false, message: `cn_lines and en_lines must be arrays at index ${i}` };
      }
    }

    return { valid: true, songCount: data.length };
  } catch (error) {
    return { valid: false, message: 'Invalid JSON format' };
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only JSON files are allowed' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate JSON structure
    const validation = await validateJsonFile(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true });

    // Generate unique filename if needed
    let filename = file.name;
    if (filename === 'praisesongs_data.json') {
      // Append timestamp to avoid overwriting main file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `praisesongs_data_${timestamp}.json`;
    }

    // Check if file already exists
    const filePath = path.join(DATA_DIR, filename);
    try {
      await fs.access(filePath);
      // File exists, append number to filename
      const nameWithoutExt = filename.replace('.json', '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `${nameWithoutExt}_${timestamp}.json`;
    } catch {
      // File doesn't exist, use original name
    }

    // Write file
    const finalPath = path.join(DATA_DIR, filename);
    await writeFile(finalPath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename,
      songCount: validation.songCount
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}