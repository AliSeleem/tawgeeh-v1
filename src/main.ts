import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/fillters/all-exceptions.filter';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
// import { Handler, Server } from 'vercel';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  // serve static files
  // app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unexpected fields
      forbidNonWhitelisted: true, // Throw error on extra fields
      transform: true, // Auto-transform DTOs
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            message: 'Validation failed',
            errors: errors.map((error) => ({
              field: error.property,
              errors: Object.values(error.constraints || {}),
            })),
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  // Apply Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Tawgeeh API')
    .setDescription('API for managing Tawgeeh')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  // listen on port
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap().catch((e) => console.error(e));

// Export for Vercel
// export const handler: Handler = (req, res) => {
//   server(req, res);
// };
export const handler = async (req, res) => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://127.0.0.1:5500', '*'],
    credentials: true,
  });
  await app.init();
  app.getHttpAdapter().getInstance()(req, res);
};
