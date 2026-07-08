import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'eduresource-bucket';
    this.s3 = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_KEY || 'default-key',
        secretAccessKey: process.env.S3_SECRET || 'default-secret',
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const fileExtension = path.extname(file.originalname);
    const key = `${uuidv4()}${fileExtension}`;
    
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Using path-style URLs as a generic fallback, though virtual-hosted is often preferred for S3
    const url = `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async replaceFile(oldKey: string, newFile: Express.Multer.File): Promise<{ key: string; url: string }> {
    await this.deleteFile(oldKey);
    return this.uploadFile(newFile);
  }
}
