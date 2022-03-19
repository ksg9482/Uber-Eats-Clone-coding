import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Category])],
    //forFeature는 typeOrmModule이 특정 feature를 import할 수 있게 해준다
    providers:[RestaurantsResolver, RestaurantsService]
})
export class RestaurantsModule {}
