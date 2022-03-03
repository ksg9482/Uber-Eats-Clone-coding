import { Module } from '@nestjs/common';
import * as Joi from 'joi';//자바스크립트 패키지라 몽땅 가져오는 것. export되지 않았음
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path/posix';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      ignoreEnvFile: process.env.NODE_ENV === 'prod', //produnction환경일 때는 configModule이 이 환경변수 파일을 무시한다
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      })
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({//nestjs에 graphql을 적용함
      driver: ApolloDriver,
      autoSchemaFile: true
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST, //wsl2때문. 보통 localhost
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, //데이터베이스를 내 모듈의 현재 상태로 마이그레이션한다는 뜻
      logging: true
    }),
    RestaurantsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

/*wsl2 를 사용하시며 윈도우에서 postgreSQL을 설치하시는 분들이 하셔야 할 것:

1. 윈도우에서 cmd -> ipconfig -> Ethernet adapter vEthernet (WSL): 의 IPv4 주소를 복사하신 후, 프로젝트의 'app.module.ts' 파일의 TypeOrmModule.forRoot 의 attribute 중 localhost 대신 써주시면 됩니다.

2. 윈도우에서 postgreSQL 이 설치된 폴더 로 가신 후 ~/data/ 폴더에 가시면 pg_hba.conf 파일이 있는데 메모장으로 열어주신 후 하단의 # TYPE DATABASE USER ADDRESS METHOD 밑에 host all all 0.0.0.0/0 md5 를 적고 저장하시면 됩니다.

3. 설정 -> firewall -> advanced setting -> 좌측 패널 inbound rules 클릭 -> 맨 우측 패널 New Rule 로 추가 -> Port -> 포트번호 입력 -> rule 이름 넣고 저장하시면 됩니다. */
