import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const configService = app.get(ConfigService); // ✅ ใช้ ConfigService อ่านค่า .env

  // ✅ ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('User Service')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ✅ ตั้งค่า RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672',
      ],
      queue: configService.get<string>('QUEUE_NAME') ?? 'user_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port, '0.0.0.0'); // ✅ ฟังทุก IP → ใช้ได้ทั้ง Docker และ Local
}
bootstrap();
