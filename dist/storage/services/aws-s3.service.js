"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AwsS3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
let AwsS3Service = AwsS3Service_1 = class AwsS3Service {
    constructor(config) {
        this.logger = new common_1.Logger(AwsS3Service_1.name);
        this.s3Client = new client_s3_1.S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.credentials.accessKeyId,
                secretAccessKey: config.credentials.secretAccessKey,
            },
        });
        this.bucket = config.bucket || '';
    }
    async generatePresignedUrl(options) {
        const { key, expiresIn, contentType, metadata, sizeLimit } = options;
        const conditions = [
            ['content-length-range', 0, sizeLimit || 0],
            ['eq', '$Content-Type', contentType || ''],
            ['eq', '$key', key],
        ];
        const metadataConditions = metadata
            ? Object.entries(metadata).map(([key, value]) => ['eq', `$x-amz-meta-${key}`, value])
            : [];
        const { url, fields } = await (0, s3_presigned_post_1.createPresignedPost)(this.s3Client, {
            Bucket: this.bucket,
            Key: key,
            Conditions: [...conditions, ...metadataConditions],
            Expires: expiresIn,
            Fields: Object.assign({ 'Content-Type': contentType || '', 'key': key }, (metadata && Object.entries(metadata).reduce((acc, [key, value]) => (Object.assign(Object.assign({}, acc), { [`x-amz-meta-${key}`]: value })), {}))),
        });
        return { url, fields };
    }
    async deleteFile(bucket, key) {
        try {
            const bucketName = bucket || this.bucket;
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key} from bucket: ${bucketName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file ${key} from bucket ${bucket}:`, error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    async copyFile(bucket, sourceKey, destinationKey, destinationBucket) {
        try {
            const sourceBucketName = bucket || this.bucket;
            const destBucketName = destinationBucket || sourceBucketName;
            const command = new client_s3_1.CopyObjectCommand({
                Bucket: destBucketName,
                CopySource: `${sourceBucketName}/${sourceKey}`,
                Key: destinationKey,
            });
            await this.s3Client.send(command);
            this.logger.log(`File copied successfully: ${sourceKey} -> ${destinationKey} (${sourceBucketName} -> ${destBucketName})`);
        }
        catch (error) {
            this.logger.error(`Failed to copy file ${sourceKey} to ${destinationKey}:`, error);
            throw new Error(`Failed to copy file: ${error.message}`);
        }
    }
};
exports.AwsS3Service = AwsS3Service;
exports.AwsS3Service = AwsS3Service = AwsS3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], AwsS3Service);
//# sourceMappingURL=aws-s3.service.js.map