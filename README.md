# @tekdi/nestjs-cloud-storage

A NestJS package for cloud storage operations with presigned URL support. Currently supports AWS S3, with extensibility for other cloud providers.

## 🚀 Package Improvements (v1.0.1+)

This package now includes pre-built TypeScript declarations and compiled JavaScript files, eliminating the need for postinstall scripts in consuming projects.

### ✅ What's New
- **No Postinstall Scripts Required** - Package installs instantly without build steps
- **Pre-built TypeScript Declarations** - Full TypeScript support out of the box
- **CI/CD Friendly** - No build tools needed during deployment
- **Automated Publishing** - GitHub Actions workflow for consistent releases
- **Smaller Package Size** - Only necessary files included
- **Better Reliability** - Pre-built files tested before publishing

### 📦 Installation (Updated)

```bash
npm install @tekdi/nestjs-cloud-storage
```

**No postinstall scripts needed in your package.json!**

## Features

- 🔒 Secure direct-to-cloud uploads using presigned URLs
- 🚀 Support for AWS S3 (extensible to other providers)
- 📦 Easy integration with NestJS applications
- 🔄 Configurable expiration times
- 📝 Metadata support
- 📏 File size limits
- 🎯 TypeScript support

## Installation

```bash
npm install @tekdi/nestjs-cloud-storage
```

OR add to your `package.json`:
```json
{
  "dependencies": {
    "@tekdi/nestjs-cloud-storage": "^1.0.1"
  }
}
```


## Quick Start

1. Import the module in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CloudStorageModule } from '@tekdi/nestjs-cloud-storage';

@Module({
  imports: [
    CloudStorageModule.register({
      provider: 'aws',
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      bucket: process.env.AWS_BUCKET,
    }),
  ],
})
export class AppModule {}
```

2. Use the service in your application:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CloudStorageService } from '@tekdi/nestjs-cloud-storage';

@Injectable()
export class YourService {
  constructor(
    @Inject('CloudStorageService')
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  async uploadFile() {
    const { url, fields } = await this.cloudStorageService.generatePresignedUrl({
      key: 'path/to/file.jpg',
      contentType: 'image/jpeg',
      expiresIn: 3600, // URL expires in 1 hour
      metadata: {
        userId: '123',
        category: 'profile',
      },
      sizeLimit: 5242880, // 5MB
    });

    return { url, fields };
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

### Module Options

The `CloudStorageModule.register()` method accepts the following configuration:

```typescript
interface CloudStorageConfig {
  provider: 'aws'; // Currently only AWS is supported
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: string;
}
```

## API Reference

### Generate Presigned URL

```typescript
interface GeneratePresignedUrlDto {
  key: string;              // The object key in the bucket
  contentType: string;      // The content type of the file
  expiresIn?: number;       // URL expiration time in seconds (default: 3600)
  metadata?: Record<string, string>; // Additional metadata
  sizeLimit?: number;       // Maximum file size in bytes (default: 10485760 - 10MB)
}
```

#### Example Request

```http
POST /storage/presigned-url
Content-Type: application/json

{
  "key": "path/to/file.jpg",
  "contentType": "image/jpeg",
  "expiresIn": 3600,
  "metadata": {
    "userId": "123",
    "category": "profile"
  },
  "sizeLimit": 5242880
}
```

#### Example Response

```json
{
  "url": "https://your-bucket.s3.amazonaws.com",
  "fields": {
    "key": "path/to/file.jpg",
    "Content-Type": "image/jpeg",
    "x-amz-meta-userId": "123",
    "x-amz-meta-category": "profile",
    "policy": "...",
    "x-amz-algorithm": "AWS4-HMAC-SHA256",
    "x-amz-credential": "...",
    "x-amz-date": "...",
    "x-amz-signature": "..."
  }
}
```

## Browser Integration

### HTML Form Example

```html
<form action="[URL]" method="post" enctype="multipart/form-data">
  <!-- Hidden fields from the response -->
  <input type="hidden" name="key" value="[fields.key]">
  <input type="hidden" name="Content-Type" value="[fields.Content-Type]">
  <input type="hidden" name="x-amz-meta-userId" value="[fields.x-amz-meta-userId]">
  <input type="hidden" name="x-amz-meta-category" value="[fields.x-amz-meta-category]">
  <input type="hidden" name="policy" value="[fields.policy]">
  <input type="hidden" name="x-amz-algorithm" value="[fields.x-amz-algorithm]">
  <input type="hidden" name="x-amz-credential" value="[fields.x-amz-credential]">
  <input type="hidden" name="x-amz-date" value="[fields.x-amz-date]">
  <input type="hidden" name="x-amz-signature" value="[fields.x-amz-signature]">
  
  <!-- File input -->
  <input type="file" name="file">
  <button type="submit">Upload</button>
</form>
```

### JavaScript Example

```javascript
async function uploadFile(file) {
  // Get presigned URL from your backend
  const response = await fetch('/storage/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: `uploads/${file.name}`,
      contentType: file.type,
      metadata: { userId: '123' }
    })
  });
  
  const { url, fields } = await response.json();
  
  // Create form data
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);
  
  // Upload to S3
  await fetch(url, {
    method: 'POST',
    body: formData
  });
}
```

## Extending for New Cloud Providers

To add support for a new cloud provider:

1. Create a new service class implementing the `CloudStorageService` interface:

```typescript
@Injectable()
export class AzureBlobService implements CloudStorageService {
  async generatePresignedUrl(options: GeneratePresignedUrlDto): Promise<{ url: string; fields: Record<string, string> }> {
    // Implementation
  }
}
```

2. Add the new provider case in the `CloudStorageModule.register()` method:

```typescript
case 'azure':
  return new AzureBlobService(config);
```

3. Update the `CloudStorageConfig` interface if needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Tekdi Technologies 
