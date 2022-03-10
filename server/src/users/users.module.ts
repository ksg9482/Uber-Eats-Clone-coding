import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './user.service';
import { UsersResolver } from './users.resolever';

@Module({
    imports:[TypeOrmModule.forFeature([User])],//글로벌 모듈로 해놔서 안넣어도 됨
    providers: [UsersResolver, UsersService],
    exports:[UsersService]
})
export class UsersModule {}
