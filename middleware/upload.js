const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/aws'); // Your existing S3 client

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const uploadToS3 = async (file, folder = 'uploads') => {
  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'astro-app',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    
    await s3Client.send(command);
    
    // Construct the URL based on whether using MinIO or real S3
    const bucket = process.env.S3_BUCKET_NAME || 'astro-app';
    
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3/MinIO:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToS3
};