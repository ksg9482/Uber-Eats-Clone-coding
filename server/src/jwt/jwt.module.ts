import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()//글로벌 모듈로 등록하기.
export class JwtModule {
    static forRoot(options: JwtModuleOptions): DynamicModule { //DynamicModule은 또다른 module을 반환해주는 module
        return{ //module이 service를 export한다
            module: JwtModule,
            //exports: [JwtService],
            exports: [{ //위는 이하 내용을 함축한 것.
                provide: JwtService,
                useClass: JwtService
            },
        ],
            providers: [JwtService,{
                provide: CONFIG_OPTIONS,
                useValue: options
              }
            ]
        }
    }
}
