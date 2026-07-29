import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('Could not connect to database (Expected if Postgres is offline).');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
