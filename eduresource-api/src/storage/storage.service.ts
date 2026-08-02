import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3: S3Client | null = null;
  private bucket: string;
  private useLocalStorage: boolean;
  private uploadsPath: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'eduresource-bucket';
    this.uploadsPath = path.resolve(process.cwd(), 'uploads');
    this.useLocalStorage =
      process.env.USE_LOCAL_STORAGE === 'true' ||
      !process.env.S3_KEY ||
      process.env.S3_KEY === 'default-key' ||
      !process.env.S3_SECRET ||
      process.env.S3_SECRET === 'default-secret';

    if (this.useLocalStorage) {
      try {
        fs.mkdirSync(this.uploadsPath, { recursive: true });
      } catch {
        // Read-only filesystem (e.g. serverless) - local storage uploads will fail,
        // but the app should still boot and serve every other route.
      }
      return;
    }

    this.s3 = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_KEY as string,
        secretAccessKey: process.env.S3_SECRET as string,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const fileExtension = path.extname(file.originalname);
    const key = `${uuidv4()}${fileExtension}`;

    if (this.useLocalStorage) {
      const filePath = path.join(this.uploadsPath, key);
      await fs.promises.writeFile(filePath, file.buffer);
      const url = `/uploads/${key}`;
      return { key, url };
    }

    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useLocalStorage) {
      await fs.promises.unlink(path.join(this.uploadsPath, key)).catch(() => undefined);
      return;
    }

    await this.s3!.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.useLocalStorage) {
      return `${process.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3!, command, { expiresIn });
  }

  async replaceFile(oldKey: string, newFile: Express.Multer.File): Promise<{ key: string; url: string }> {
    await this.deleteFile(oldKey);
    return this.uploadFile(newFile);
  }
}
