import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk'

const BUCKET_NAME = 'a7bx37p9ascq1b';
@Controller('uploads')
export class UploadsController {
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
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