import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk'

const BUCKET_NAME = 'a7bx37p9ascq1b';
@Controller('uploads')
export class UploadsController {
    constructor(private readonly configService:ConfigService) {}
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        // console.log(
        //     accessKeyId: this.configService.get('AWS_KEY'),
        // secretAccessKey: this.configService.get('AWS_SECRET')
        // )
        AWS.config.update({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        try {
            const objectName = `${Date.now() + file.originalname}`
            await new AWS.S3()
            .putObject({
                Bucket: BUCKET_NAME,
                Key: objectName,
                Body: file.buffer,
                ACL: 'public-read'
            })
            .promise();
            const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
            return {url}
        } catch (error) {
            return null
        }
    }
}