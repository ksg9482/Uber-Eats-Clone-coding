import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

@Module({})
@Global()//글로벌 모듈로 등록하기.
export class JwtModule {
    static forRoot(): DynamicModule { //DynamicModule은 또다른 module을 반환해주는 module
        return{ //module이 service를 export한다ㅜㄷ
            module: JwtModule,
            exports: [JwtService],
            providers: [JwtService]
        }
    }
}
