// import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(PrismaService.name);

//   async onModuleInit() {
//     this.logger.log('📡 Intentando conectar a la base de datos...');

//     try {
//       await this.$connect();
//       this.logger.log('✅ Conexión exitosa a la base de datos.');
//     } catch (error) {
//       this.logger.error('❌ Error al conectar a la base de datos:', error);
//       throw error; // Para que el deploy falle y te avise.
//     }
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//     this.logger.log('🔌 Desconectado de la base de datos.');
//   }
// }



import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}