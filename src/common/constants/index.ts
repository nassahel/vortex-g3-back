const env = process.env;

export const awsConfig = {
  client: {
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  },
  s3: {
    bucket: env.AWS_BUCKET,
  },
};
