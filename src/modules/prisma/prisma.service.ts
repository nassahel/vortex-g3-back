import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor() {
    const databaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.DATABASE_URL_POOLER  // En producción usa el pooler
      : process.env.DATABASE_URL;        // En local usa la conexión directa

    process.env.DATABASE_URL = databaseUrl;  // Sobrescribimos DATABASE_URL

    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
