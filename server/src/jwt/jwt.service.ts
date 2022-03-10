import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from "jsonwebtoken";
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS) 
        private readonly options: JwtModuleOptions,
        //private readonly configService: ConfigService
        ) {}

        sign(userId: number): string {
            return jwt.sign({id: userId}, /*this.configService.get('PRIVATE_KEY')*/this.options.privateKey)
        }

        verify(token: string) {
            return jwt.verify(token, this.options.privateKey);
        }
        //주석과 같은 방법을 이용해서도 할 수 있다. 글로벌 모듈을 이용하는 장점.
}
