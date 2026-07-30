import fs from 'fs/promises';
import path from 'path';
import { ApiError } from '../utils/apiError';

class FileService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      await fs.unlink(fullPath);
    } catch {
      throw ApiError.notFound('File not found');
    }
  }

  async getFileInfo(filePath: string) {
    try {
      const fullPath = path.resolve(filePath);
      const stat = await fs.stat(fullPath);
      return {
        name: path.basename(fullPath),
        size: stat.size,
        createdAt: stat.birthtime,
      };
    } catch {
      throw ApiError.notFound('File not found');
    }
  }
}

export const fileService = new FileService();
