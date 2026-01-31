import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { randomBytes } from 'crypto';
import { MulterFile } from '@app/common';

@Injectable()
export class FileService {
  private s3: S3;
  private bucketAvatars: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION') || 'us-east-1',
    });

    this.bucketAvatars = this.configService.get('AWS_BUCKET_NAME') || 'kibtop-s3-2026';
  }

  async uploadAvatar(file: MulterFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileContent = file.buffer;
      const fileName = file.originalname;
      const rh = randomBytes(5).toString('hex');

      const params = {
        Bucket: this.bucketAvatars,
        Key: `${rh}-${fileName}`,
        Body: fileContent,
      };

      this.s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
        if (err) {
          console.error('Error uploading file to S3', err);
          reject(new Error('Error uploading file to S3'));
        } else {
          resolve(data.Location);
        }
      });
    });
  }
}
