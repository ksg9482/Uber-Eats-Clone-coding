import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
    providers: [{
        provide: APP_GUARD,
        useClass: AuthGuard
    }]
})
//APP_GUARD를 쓰면 모든 곳에서 작동된다 -> createAccount에도 적용됨
export class AuthModule {}
