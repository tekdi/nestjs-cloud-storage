"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const aws_s3_service_1 = require("./aws-s3.service");
describe('AwsS3Service', () => {
    let service;
    const mockConfig = {
        provider: 'aws',
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'test-access-key',
            secretAccessKey: 'test-secret-key',
        },
        bucket: 'test-bucket',
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                {
                    provide: aws_s3_service_1.AwsS3Service,
                    useFactory: () => new aws_s3_service_1.AwsS3Service(mockConfig),
                },
            ],
        }).compile();
        service = module.get(aws_s3_service_1.AwsS3Service);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should have correct configuration', () => {
        expect(service).toBeInstanceOf(aws_s3_service_1.AwsS3Service);
    });
});
//# sourceMappingURL=aws-s3.service.spec.js.map