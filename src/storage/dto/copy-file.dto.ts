import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CopyFileDto {
  @IsString()
  @IsNotEmpty()
  sourceKey: string;

  @IsString()
  @IsNotEmpty()
  destinationKey: string;

  @IsString()
  @IsOptional()
  sourceBucket?: string;

  @IsString()
  @IsOptional()
  destinationBucket?: string;
}