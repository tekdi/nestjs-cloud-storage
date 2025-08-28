import { Controller, Post, Delete, Body, Param, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { CloudStorageService } from '../storage/interfaces/cloud-storage.interface';
import { GeneratePresignedUrlDto } from '../storage/dto/generate-presigned-url.dto';
import { CopyFileDto } from '../storage/dto/copy-file.dto';

@Controller('storage')
export class CloudStorageController {
  constructor(
    @Inject('CloudStorageService')
    private readonly cloudStorageService: CloudStorageService
  ) {}

  @Post('presigned-url')
  async generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    const { url, fields } = await this.cloudStorageService.generatePresignedUrl(dto);
    return { url, fields };
  }

  /**
   * Delete a file from S3 bucket
   * @param key - File key/path in the bucket
   * @returns Success message
   */
  @Delete('files/:key')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('key') key: string) {
    await this.cloudStorageService.deleteFile('', key);
    
    return {
      success: true,
      message: `File ${key} deleted successfully`,
      deletedKey: key,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Copy a file within the same bucket or across buckets
   * @param copyFileDto - Copy file data transfer object
   * @returns Success message
   */
  @Post('files/copy')
  @HttpCode(HttpStatus.OK)
  async copyFile(@Body() copyFileDto: CopyFileDto) {
    await this.cloudStorageService.copyFile(
      copyFileDto.sourceBucket || '',
      copyFileDto.sourceKey,
      copyFileDto.destinationKey,
      copyFileDto.destinationBucket
    );
    
    return {
      success: true,
      message: 'File copied successfully',
      sourceKey: copyFileDto.sourceKey,
      destinationKey: copyFileDto.destinationKey,
      timestamp: new Date().toISOString(),
    };
  }
} 