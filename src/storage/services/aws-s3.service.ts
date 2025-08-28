import { Injectable, Logger } from '@nestjs/common';
import { S3Client, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { CloudStorageService, CloudStorageConfig } from '../interfaces/cloud-storage.interface';
import { GeneratePresignedUrlDto } from '../dto/generate-presigned-url.dto';

type PolicyEntry = ['content-length-range', number, number] | ['eq', string, string];

@Injectable()
export class AwsS3Service implements CloudStorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(AwsS3Service.name);

  constructor(config: CloudStorageConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.credentials.accessKeyId!,
        secretAccessKey: config.credentials.secretAccessKey!,
      },
    });
    this.bucket = config.bucket || '';
  }

  async generatePresignedUrl(options: GeneratePresignedUrlDto): Promise<{ url: string; fields: Record<string, string> }> {
    const { 
      key, 
      expiresIn,
      contentType, 
      metadata,
      sizeLimit
    } = options;

    const conditions: PolicyEntry[] = [
      ['content-length-range', 0, sizeLimit || 0],
      ['eq', '$Content-Type', contentType || ''],
      ['eq', '$key', key],
    ];

    const metadataConditions: PolicyEntry[] = metadata 
      ? Object.entries(metadata).map(([key, value]) => 
          ['eq', `$x-amz-meta-${key}`, value] as PolicyEntry
        )
      : [];

    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [...conditions, ...metadataConditions],
      Expires: expiresIn,
      Fields: {
        'Content-Type': contentType || '',
        'key': key,
        ...(metadata && Object.entries(metadata).reduce((acc, [key, value]) => ({
          ...acc,
          [`x-amz-meta-${key}`]: value,
        }), {})),
      },
    });

    return { url, fields };
  }

  /**
   * Delete a file from S3 bucket
   * @param bucket - S3 bucket name (optional, uses default if not provided)
   * @param key - File key/path in the bucket
   * @returns Promise<void>
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const bucketName = this.bucket;
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key} from bucket: ${bucketName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key} from bucket ${bucket}:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Copy a file within the same bucket or across buckets
   * @param bucket - Source bucket name (optional, uses default if not provided)
   * @param sourceKey - Source file key/path
   * @param destinationKey - Destination file key/path
   * @param destinationBucket - Destination bucket (optional, uses source bucket if not provided)
   * @returns Promise<void>
   */
  async copyFile(
    sourceKey: string, 
    destinationKey: string,
  ): Promise<void> {
    try {
      const sourceBucketName = this.bucket;
      const destBucketName = this.bucket;

      const command = new CopyObjectCommand({
        Bucket: destBucketName,
        CopySource: `${sourceBucketName}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.s3Client.send(command);
      this.logger.log(
        `File copied successfully: ${sourceKey} -> ${destinationKey} (${sourceBucketName} -> ${destBucketName})`
      );
    } catch (error) {
      this.logger.error(
        `Failed to copy file ${sourceKey} to ${destinationKey}:`, 
        error
      );
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }
} 