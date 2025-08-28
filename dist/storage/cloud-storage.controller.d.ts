import { CloudStorageService } from '../storage/interfaces/cloud-storage.interface';
import { GeneratePresignedUrlDto } from '../storage/dto/generate-presigned-url.dto';
import { CopyFileDto } from './dto/copy-file.dto';
export declare class CloudStorageController {
    private readonly cloudStorageService;
    constructor(cloudStorageService: CloudStorageService);
    generatePresignedUrl(dto: GeneratePresignedUrlDto): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    deleteFile(key: string): Promise<{
        success: boolean;
        message: string;
        deletedKey: string;
        timestamp: string;
    }>;
    copyFile(copyFileDto: CopyFileDto): Promise<{
        success: boolean;
        message: string;
        sourceKey: string;
        destinationKey: string;
        timestamp: string;
    }>;
}
