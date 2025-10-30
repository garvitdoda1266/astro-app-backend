const { S3Client } = require('@aws-sdk/client-s3');

// Debug: Check if credentials are loaded
console.log('AWS Configuration Debug:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET (length: ' + process.env.AWS_ACCESS_KEY_ID.length + ')' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'NOT SET');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
console.log('S3_ENDPOINT:', process.env.S3_ENDPOINT);

const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// If S3_ENDPOINT is provided, assume MinIO or another S3-compatible service
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}

const s3Client = new S3Client(s3Config);

module.exports = s3Client;