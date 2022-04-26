import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';


@Module({})
@Global()
export class MailModule {
    static forRoot(options: MailModuleOptions): DynamicModule { //DynamicModule은 또다른 module을 반환해주는 module
        return { //module이 service를 export한다
            module: MailModule,
            //exports: [JwtService],
            exports: [MailService],
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: options
                },
                MailService
            ]
        }
    }
}
