import { CloudStorageService, CloudStorageConfig } from '../interfaces/cloud-storage.interface';
import { GeneratePresignedUrlDto } from '../dto/generate-presigned-url.dto';
export declare class AwsS3Service implements CloudStorageService {
    private readonly s3Client;
    private readonly bucket;
    private readonly logger;
    constructor(config: CloudStorageConfig);
    generatePresignedUrl(options: GeneratePresignedUrlDto): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    deleteFile(bucket: string, key: string): Promise<void>;
    copyFile(bucket: string, sourceKey: string, destinationKey: string, destinationBucket?: string): Promise<void>;
}
