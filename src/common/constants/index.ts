const env = process.env;

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// CONSTANTES AWS
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

//CONSTANTES MAILJET
export const messagingConfig = {
  emailSender: env.EMAIL_SENDER,
  apiKey: env.MAILJET_API_KEY,
  secret: env.MAILJET_SECRET_KEY,
  resetPasswordUrls: {
    backoffice: env.BACKOFFICE_RESET_PASSWORD_URL,
  },
};

export const mercadopagoConfig = {
  accessToken: env.MP_ACCESS_TOKEN,
  webhookUrl: env.MP_WEBHOOK_URL,
};
