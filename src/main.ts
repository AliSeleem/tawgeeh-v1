import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/fillters/all-exceptions.filter';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { ValidationError } from 'class-validator';
import { CairoDateInterceptor } from './common/interceptors/timezone';
import { CairoDatePipe } from './common/pips/timezone';
// import { Handler, Server } from 'vercel';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  // 👉 Mount backend under /api
  app.setGlobalPrefix('api', {
    exclude: [''], // root excluded so "/" still serves frontend
  });
  
  // // serve static files
  // const publicPath = path.join(__dirname, '..', 'public');
  // app.useStaticAssets(publicPath);

  // // set index.html as default
  // app.setBaseViewsDir(path.join(__dirname, '..', 'public', 'index.html'));
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
              errors: extractValidationErrors(errors),
            })),
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  app.useGlobalInterceptors(new CairoDateInterceptor());
  app.useGlobalPipes(new CairoDatePipe());

  // Apply Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

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
// export const handler = async (req, res) => {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors();
//   await app.init();
//   app.getHttpAdapter().getInstance()(req, res);
// };

// Recursive function to extract nested validation errors
function extractValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { field: string; errors: string[] }[] {
  return errors.flatMap((error) => {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const currentErrors = error.constraints
      ? [
          {
            field: fieldPath,
            errors: Object.values(error.constraints),
          },
        ]
      : [];

    const childrenErrors = error.children?.length
      ? extractValidationErrors(error.children, fieldPath)
      : [];

    return [...currentErrors, ...childrenErrors];
  });
}
