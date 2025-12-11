import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',  // change later for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Enable global DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // remove unknown fields
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Enable graceful shutdown for Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // API Prefix (Optional)
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000/api`);
}
bootstrap();
