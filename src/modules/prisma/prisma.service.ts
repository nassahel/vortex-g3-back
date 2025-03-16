import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.DATABASE_URL_POOLER  // En producción usa el pooler
      : process.env.DATABASE_URL;        // En local usa la conexión directa

    // Sobrescribimos DATABASE_URL antes de crear la instancia de PrismaClient
    process.env.DATABASE_URL = databaseUrl;

    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión exitosa a la base de datos');
    } catch (error) {
      this.logger.error('Error al conectar con la base de datos', error.stack);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Conexión a la base de datos cerrada');
  }
}
