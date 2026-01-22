import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { randomBytes } from 'crypto';
import { MulterFile } from '@app/common';

@Injectable()
export class FileService {
  private s3: S3;
  private bucketAdverts: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION') || 'us-east-1',
    });

    // Use AWS_BUCKET_NAME with suffix or fallback to AWS_BUCKET_ADVERTS
    const bucketName = this.configService.get('AWS_BUCKET_NAME');
    this.bucketAdverts = bucketName 
      ? `${bucketName}.adverts`
      : this.configService.get('AWS_BUCKET_ADVERTS') || 'kibtop.adverts';
  }

  async uploadAdvertPhoto(file: MulterFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileContent = file.buffer;
      const fileName = file.originalname;
      const rh = randomBytes(10).toString('hex');

      const params = {
        Bucket: this.bucketAdverts,
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
