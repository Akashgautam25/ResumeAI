import fs from 'fs';
import path from 'path';
import { env } from '../../config/env.js';

export interface FileStorageProvider {
  saveFile(file: Express.Multer.File, userId: string): Promise<{ url: string; path: string; size: number }>;
  deleteFile(filePath: string): Promise<void>;
  getFileStream(filePath: string): fs.ReadStream;
}

class LocalStorageProvider implements FileStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, userId: string): Promise<{ url: string; path: string; size: number }> {
    const userDir = path.join(this.baseDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const targetPath = path.join(userDir, path.basename(file.path));
    fs.renameSync(file.path, targetPath);

    const relativeUrl = `/api/files/${userId}/${path.basename(targetPath)}`;

    return {
      url: relativeUrl,
      path: targetPath,
      size: file.size,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFileStream(filePath: string): fs.ReadStream {
    return fs.createReadStream(filePath);
  }
}

export const storageService: FileStorageProvider = new LocalStorageProvider();
