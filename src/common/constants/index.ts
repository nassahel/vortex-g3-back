export enum RoleEnum {
    ADMIN = 'ADMIN',
    USER = 'USER',
  }
  
const env = process.env;

export const awsConfig = {
    client: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    },
    s3: {
      bucket: env.AWS_BUCKET,
    },
  } as const;
