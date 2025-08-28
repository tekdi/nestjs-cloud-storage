import { GeneratePresignedUrlDto } from "../dto/generate-presigned-url.dto";
export interface CloudStorageConfig {
    provider?: 'aws' | 'azure' | 'gcp';
    region?: string;
    credentials: {
        accessKeyId?: string;
        secretAccessKey?: string;
        [key: string]: any;
    };
    bucket?: string;
}
export interface CloudStorageService {
    generatePresignedUrl(options: GeneratePresignedUrlDto): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    deleteFile(bucket: string, key: string): Promise<void>;
    copyFile(bucket: string, sourceKey: string, destinationKey: string, destinationBucket?: string): Promise<void>;
}
