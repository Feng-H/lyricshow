import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'bilingual-praise-songs-secret-key';
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Helper to verify admin
async function verifyAdmin(): Promise<boolean> {
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

export async function GET() {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    let config = { activeFile: 'praisesongs_data.json' };
    
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf-8');
      config = JSON.parse(content);
    } catch (error) {
      // If config doesn't exist, create it with default
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Config load error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { activeFile } = body;

    if (!activeFile) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Verify file exists
    const filePath = path.join(DATA_DIR, activeFile);
    try {
      await fs.access(filePath);
    } catch {
      console.error('File not found for config:', filePath);
      return NextResponse.json({ error: 'File does not exist' }, { status: 404 });
    }

    // Save config
    const configData = { activeFile };
    console.log('Saving config to:', CONFIG_FILE, configData);
    await fs.writeFile(CONFIG_FILE, JSON.stringify(configData, null, 2));

    return NextResponse.json({ success: true, activeFile });
  } catch (error) {
    console.error('Config save error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
