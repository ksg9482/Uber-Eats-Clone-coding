import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 4000);
}
bootstrap();


/*헤로쿠 설정
heroku config:set NODE_ENV=prod  콘솔이용해서 하기
헤로쿠 어플리케이션 페이지에서 설정 애드온에서 postgres 설치
credential페이지에 정보 나와있음. 그거 입력하면 됨
private_key설정 -> 생성기로 긁음 됨
mailgun도 해야됨, aws_key, aws_secret
heroku config:set NODE_ENV=production 환경변수를 production으로 조정

헤로쿠 데이터베이스는 수시로 변경됨 그래서 환경변수를 감지할 수 있게 해주어야 한다
제공된 url을 사용
url:process.env.DATABASE_URL
*/
