import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import multer, { StorageEngine } from 'multer';
import multerS3 from 'multer-s3';

interface MulterConfig {
  storage: StorageEngine;
  dest: string;
}

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
});

const StorageTypes: Record<string, StorageEngine> = {
  local: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destinationPath = path.resolve(process.cwd(), 'tmp', 'uploads');
      fs.mkdirSync(destinationPath, { recursive: true });
      cb(null, destinationPath);
    },
    filename: (_req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err, '');

        const fileName = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
  s3: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || '',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (_req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err, '');

        const fileName = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

const multerConfig: MulterConfig = {
  storage: StorageTypes[process.env.STORAGE_TYPE],
  dest: path.resolve(process.cwd(), 'tmp', 'uploads'),
};

export { multerConfig };
