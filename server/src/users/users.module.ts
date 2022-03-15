import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolever';

@Module({
    imports:[TypeOrmModule.forFeature([User, Verification])],//글로벌 모듈로 해놓으면 안넣어도 됨. 선택중요
    providers: [UsersResolver, UsersService],
    exports:[UsersService]
})
export class UsersModule {}
