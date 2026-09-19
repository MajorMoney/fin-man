import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FinManLogger } from './fin-man-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
  logger: new FinManLogger(),
});
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
