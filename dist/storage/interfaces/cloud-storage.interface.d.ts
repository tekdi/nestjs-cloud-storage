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
    deleteFile(key: string): Promise<void>;
    copyFile(sourceKey: string, destinationKey: string): Promise<void>;
}
